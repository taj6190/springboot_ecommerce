package com.ecommerce.backend.config;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

/**
 * Cloudinary Configuration
 *
 * Configures and initializes the Cloudinary client used for:
 * - Image uploads
 * - Product media management
 * - Banner and slider image storage
 * - Cloud-based media delivery
 *
 * Credentials are loaded securely from application properties.
 */
@Configuration
public class CloudinaryConfig {

    /**
     * Cloudinary cloud name.
     * Identifies the Cloudinary account/workspace.
     */
    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    /**
     * Cloudinary API key used for authentication.
     */
    @Value("${cloudinary.api-key}")
    private String apiKey;

    /**
     * Cloudinary API secret used for secure API operations.
     * Should never be exposed to frontend applications.
     */
    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    /**
     * Creates and registers a Cloudinary bean in the Spring context.
     *
     * The bean can be injected into services responsible for:
     * - File uploads
     * - Image deletion
     * - Media transformations
     *
     * "secure" = true ensures HTTPS URLs are generated.
     */
    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(Map.of(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
        ));
    }
}