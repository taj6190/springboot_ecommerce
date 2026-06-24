package com.ecommerce.backend.config;

import com.ecommerce.backend.security.JwtAuthenticationEntryPoint;
import com.ecommerce.backend.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Security Configuration
 *
 * Configures Spring Security for the application using JWT-based authentication.
 *
 * Key features:
 * - Stateless authentication (no sessions)
 * - JWT filter integration
 * - Role-based access control (RBAC)
 * - Public and protected endpoint separation
 * - CORS integration for frontend communication
 *
 * This is the core security layer of the application.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    /**
     * JWT filter that validates tokens on every request.
     */
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Handles unauthorized access responses (401 errors).
     */
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    /**
     * CORS configuration for frontend-backend communication.
     */
    private final CorsConfigurationSource corsConfigurationSource;

    /**
     * Password encoder using BCrypt hashing algorithm.
     *
     * Strength 12 provides a good balance between security and performance.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    /**
     * AuthenticationManager used for authentication operations
     * such as login (username/password validation).
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Main Spring Security filter chain configuration.
     *
     * Defines:
     * - CORS settings
     * - CSRF protection (disabled for stateless APIs)
     * - Session management (STATELESS for JWT)
     * - Endpoint security rules
     * - JWT filter integration
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                // Enable CORS using custom configuration
                .cors(cors -> cors.configurationSource(corsConfigurationSource))

                // Disable CSRF since JWT is used (stateless API)
                .csrf(csrf -> csrf.disable())

                // Handle authentication errors (401 Unauthorized)
                .exceptionHandling(ex -> ex.authenticationEntryPoint(jwtAuthenticationEntryPoint))

                // Stateless session management (no server-side sessions)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Define authorization rules
                .authorizeHttpRequests(auth -> auth

                        // Public authentication endpoints (login, register, etc.)
                        .requestMatchers("/auth/**").permitAll()

                        // API documentation (Swagger/OpenAPI)
                        .requestMatchers("/swagger-ui/**", "/api-docs/**", "/swagger-ui.html").permitAll()

                        // Health check endpoint for monitoring
                        .requestMatchers("/actuator/health").permitAll()

                        // Public order endpoints (guest checkout support)
                        .requestMatchers(HttpMethod.POST, "/public/orders").permitAll()

                        // Other public APIs
                        .requestMatchers("/public/**").permitAll()

                        // Admin-only endpoints with multiple roles
                        .requestMatchers("/admin/**")
                        .hasAnyRole(
                                "ADMIN",
                                "PRODUCT_MANAGER",
                                "INVENTORY_MANAGER",
                                "CONTENT_EDITOR"
                        )

                        // All other endpoints require authentication
                        .anyRequest().authenticated()
                )

                // Add JWT filter before Spring Security authentication filter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}