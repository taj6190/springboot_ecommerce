package com.ecommerce.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

/**
 * Audit Configuration
 *
 * Configures Spring Data JPA Auditing support.
 *
 * This class provides the current authenticated user so that
 * audit fields such as:
 * - createdBy
 * - updatedBy
 *
 * can be populated automatically by Spring Data JPA.
 */
@Configuration
public class AuditConfig {

    /**
     * Provides the current auditor (logged-in user).
     *
     * Spring automatically calls this bean whenever an entity
     * with @CreatedBy or @LastModifiedBy is persisted or updated.
     *
     * Returns:
     * - Authenticated username when a user is logged in
     * - "SYSTEM" when operation is executed without authentication
     *   (startup tasks, batch jobs, migrations, etc.)
     */
    @Bean
    public AuditorAware<String> auditorAware() {
        return () -> {

            // Retrieve current authentication from Spring Security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            // Handle unauthenticated or anonymous requests
            if (authentication == null || !authentication.isAuthenticated()
                    || "anonymousUser".equals(authentication.getPrincipal())) {
                return Optional.of("SYSTEM");
            }

            // Return authenticated username
            return Optional.of(authentication.getName());
        };
    }
}