package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.auth.*;
import com.ecommerce.backend.entity.Role;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.enums.RoleName;
import com.ecommerce.backend.exception.BadRequestException;
import com.ecommerce.backend.exception.DuplicateResourceException;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.repository.RoleRepository;
import com.ecommerce.backend.repository.UserRepository;
import com.ecommerce.backend.security.CustomUserDetails;
import com.ecommerce.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Authentication Service
 *
 * Handles the business logic for customer/admin registration, login validation,
 * token generation, token refresh cycles, and user session termination/logout.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    /**
     * Repository interface for checking, retrieving, and updating User entity records.
     */
    private final UserRepository userRepository;

    /**
     * Repository interface for role retrieval and verification.
     */
    private final RoleRepository roleRepository;

    /**
     * Password encoder to hash user password credentials before persistence.
     */
    private final PasswordEncoder passwordEncoder;

    /**
     * Spring Security authentication manager for login credential validation.
     */
    private final AuthenticationManager authenticationManager;

    /**
     * JWT utility provider to generate, parse, and validate access and refresh tokens.
     */
    private final JwtTokenProvider tokenProvider;


    /**
     * Registers a new customer in the database.
     * Encrypts the password, assigns the ROLE_CUSTOMER role, and automatically signs them in.
     *
     * @param request user registration details
     * @return the AuthResponse containing access/refresh tokens and user profile details
     * @throws DuplicateResourceException if the email is already registered
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        Role customerRole = roleRepository.findByName(RoleName.ROLE_CUSTOMER)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", RoleName.ROLE_CUSTOMER));

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .address(request.getAddress())
                .city(request.getCity())
                .district(request.getDistrict())
                .postalCode(request.getPostalCode())
                .roles(Set.of(customerRole))
                .build();

        userRepository.save(user);
        log.info("User registered: {}", user.getEmail());

        // Auto-login after registration
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        return generateAuthResponse(authentication);
    }

    /**
     * Authenticates existing user credentials.
     *
     * @param request the user credentials
     * @return the AuthResponse with JWT tokens and user profile details
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        return generateAuthResponse(authentication);
    }

    /**
     * Generates a new access token using a valid, matching refresh token.
     * Rotates the refresh token in the database to prevent replay attacks.
     *
     * @param request payload containing the refresh token
     * @return a new AuthResponse with access and refresh tokens
     * @throws BadRequestException if the token is invalid, expired, or doesn't match the database record
     */
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!tokenProvider.validateToken(refreshToken)) {
            throw new BadRequestException("Invalid or expired refresh token");
        }

        String email = tokenProvider.getEmailFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        if (!refreshToken.equals(user.getRefreshToken())) {
            throw new BadRequestException("Refresh token does not match");
        }

        CustomUserDetails userDetails = CustomUserDetails.fromUser(user);
        String newAccessToken = tokenProvider.generateAccessToken(userDetails);
        String newRefreshToken = tokenProvider.generateRefreshToken(email);

        user.setRefreshToken(newRefreshToken);
        user.setRefreshTokenExpiryDate(
                Instant.now().plusMillis(tokenProvider.getRefreshTokenExpiration()));
        userRepository.save(user);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(user.getRoles().stream()
                        .map(r -> r.getName().name())
                        .collect(Collectors.toSet()))
                .build();
    }

    /**
     * Terminates a user session by invalidating/deleting the refresh token in the database.
     *
     * @param email user email address to logout
     */
    @Transactional
    public void logout(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        user.setRefreshToken(null);
        user.setRefreshTokenExpiryDate(null);
        userRepository.save(user);
    }

    /**
     * Generates JWT access/refresh tokens and stores the refresh token in the user entity record.
     *
     * @param authentication the Spring Security authentication principal
     * @return the generated AuthResponse
     */
    private AuthResponse generateAuthResponse(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String accessToken = tokenProvider.generateAccessToken(userDetails);
        String refreshToken = tokenProvider.generateRefreshToken(userDetails.getEmail());

        // Save refresh token to DB
        User user = userRepository.findByEmail(userDetails.getEmail())
                .orElseThrow();
        user.setRefreshToken(refreshToken);
        user.setRefreshTokenExpiryDate(
                Instant.now().plusMillis(tokenProvider.getRefreshTokenExpiration()));
        userRepository.save(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .email(userDetails.getEmail())
                .fullName(userDetails.getFullName())
                .roles(userDetails.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.toSet()))
                .build();
    }
}
