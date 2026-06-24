package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.ApiResponse;
import com.ecommerce.backend.dto.auth.*;
import com.ecommerce.backend.security.CustomUserDetails;
import com.ecommerce.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication Controller
 *
 * Exposes endpoints for user authentication and authorization management.
 * Provides APIs for user registration, user login, token refresh, and logout functionality.
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Auth endpoints")
public class AuthController {

    /**
     * Service handling the business logic for authentication.
     */
    private final AuthService authService;

    /**
     * Registers a new customer account in the system.
     *
     * @param request the registration details including name, email, password, address, etc.
     * @return a ResponseEntity containing the api response with the registration result and JWT tokens
     */
    @PostMapping("/register")
    @Operation(summary = "Register a new customer account")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Registration successful", response));
    }

    /**
     * Authenticates a user with email and password credentials.
     *
     * @param request the login request containing email and password
     * @return a ResponseEntity containing the access token, refresh token, and user details
     */
    @PostMapping("/login")
    @Operation(summary = "Login with email and password")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    /**
     * Generates a new access token using a valid refresh token.
     *
     * @param request the refresh token request
     * @return a ResponseEntity containing the new access token and refresh token
     */
    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", response));
    }

    /**
     * Logs out the current user, invalidating their refresh token in the database.
     *
     * @param userDetails the authenticated user's principal details
     * @return a ResponseEntity indicating successful logout
     */
    @PostMapping("/logout")
    @Operation(summary = "Logout and invalidate refresh token")
    public ResponseEntity<ApiResponse<Void>> logout(@AuthenticationPrincipal CustomUserDetails userDetails) {
        authService.logout(userDetails.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }
}

