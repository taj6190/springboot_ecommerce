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

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

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

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        return generateAuthResponse(authentication);
    }

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

    @Transactional
    public void logout(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        user.setRefreshToken(null);
        user.setRefreshTokenExpiryDate(null);
        userRepository.save(user);
    }

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
