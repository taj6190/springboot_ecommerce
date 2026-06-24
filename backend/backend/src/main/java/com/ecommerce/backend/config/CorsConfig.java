package com.ecommerce.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * CORS Configuration
 *
 * Configures Cross-Origin Resource Sharing (CORS) rules
 * to allow frontend applications to communicate with the backend API.
 *
 * Common use cases:
 * - React frontend → Spring Boot backend
 * - Mobile applications → API server
 * - Admin panel → Backend services
 *
 * Allowed origins are loaded from application configuration
 * for flexibility across environments.
 */
@Configuration
public class CorsConfig {

    /**
     * Comma-separated list of allowed frontend origins.
     *
     * Example:
     * http://localhost:3000,https://admin.example.com
     */
    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    /**
     * Creates the application's CORS configuration source.
     *
     * Configuration includes:
     * - Allowed origins
     * - Allowed HTTP methods
     * - Allowed request headers
     * - Exposed response headers
     * - Credential support (cookies/tokens)
     * - Browser preflight cache duration
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        // Create CORS configuration object
        CorsConfiguration configuration = new CorsConfiguration();

        // Configure allowed frontend origins
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));

        // Allowed HTTP methods for API access
        configuration.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
        ));

        // Allow all request headers
        configuration.setAllowedHeaders(List.of("*"));

        // Response headers accessible from frontend JavaScript
        configuration.setExposedHeaders(List.of(
                "Authorization",
                "Content-Disposition"
        ));

        // Allow cookies and authentication credentials
        configuration.setAllowCredentials(true);

        // Cache preflight request results for 1 hour
        configuration.setMaxAge(3600L);

        // Apply CORS configuration to all API endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}