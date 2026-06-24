package com.ecommerce.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI (Swagger) Configuration
 *
 * Provides API documentation for the backend services.
 *
 * Features enabled:
 * - Interactive Swagger UI
 * - JWT Bearer authentication support
 * - Centralized API documentation
 *
 * This configuration is essential for:
 * - Frontend integration (React/Angular/mobile apps)
 * - API testing during development
 * - External developer consumption
 */
@Configuration
public class OpenApiConfig {

    /**
     * Configures OpenAPI documentation metadata and security scheme.
     *
     * Includes:
     * - API title, version, and description
     * - Contact information
     * - JWT Bearer authentication configuration
     */
    @Bean
    public OpenAPI customOpenAPI() {

        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()

                // General API information displayed in Swagger UI
                .info(new Info()
                        .title("BD E-Commerce API")
                        .version("1.0.0")
                        .description("Production-ready Bangladeshi E-Commerce Platform API")
                        .contact(new Contact()
                                .name("BD E-Commerce")
                                .email("support@bdecommerce.com")))

                // Apply global security requirement (JWT required for endpoints)
                .addSecurityItem(
                        new SecurityRequirement().addList(securitySchemeName)
                )

                // Define JWT Bearer authentication scheme
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                        )
                );
    }
}