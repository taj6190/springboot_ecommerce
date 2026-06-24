package com.ecommerce.backend.config;

import com.ecommerce.backend.entity.Role;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.enums.RoleName;
import com.ecommerce.backend.repository.RoleRepository;
import com.ecommerce.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

/**
 * DataSeeder
 *
 * Executes automatically during application startup to initialize
 * required system data.
 *
 * Responsibilities:
 * - Create predefined system roles
 * - Create a default administrator account
 *
 * This ensures the application is usable immediately after deployment
 * without requiring manual database setup.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    /**
     * Repository for role management.
     */
    private final RoleRepository roleRepository;

    /**
     * Repository for user management.
     */
    private final UserRepository userRepository;

    /**
     * Password encoder used to securely store passwords.
     */
    private final PasswordEncoder passwordEncoder;

    /**
     * Default administrator email loaded from application properties.
     */
    @Value("${app.admin.default-email}")
    private String adminEmail;

    /**
     * Default administrator password loaded from application properties.
     * This password is encoded before being stored.
     */
    @Value("${app.admin.default-password}")
    private String adminPassword;

    /**
     * Entry point executed automatically when the application starts.
     *
     * Wrapped in a transaction to ensure consistency during initialization.
     */
    @Override
    @Transactional
    public void run(String... args) {

        // Create predefined system roles if they do not already exist
        seedRoles();

        // Create default administrator account if it does not exist
        seedAdminUser();
    }

    /**
     * Creates all roles defined in the RoleName enum.
     *
     * Existing roles are skipped to avoid duplicates.
     */
    private void seedRoles() {

        for (RoleName roleName : RoleName.values()) {

            if (!roleRepository.existsByName(roleName)) {

                Role role = Role.builder()
                        .name(roleName)

                        // Generate a human-readable description from enum name
                        .description(
                                roleName.name()
                                        .replace("ROLE_", "")
                                        .replace("_", " ")
                        )
                        .build();

                roleRepository.save(role);

                log.info("Role created: {}", roleName);
            }
        }
    }

    /**
     * Creates the default administrator account.
     *
     * The account is created only if the configured admin email
     * does not already exist in the database.
     */
    private void seedAdminUser() {

        if (!userRepository.existsByEmail(adminEmail)) {

            // Retrieve administrator role
            Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Admin role not found"));

            // Create administrator account
            User admin = User.builder()
                    .fullName("System Admin")
                    .email(adminEmail)

                    // Password is encoded before persistence
                    .password(passwordEncoder.encode(adminPassword))

                    .phone("01700000000")
                    .roles(Set.of(adminRole))
                    .enabled(true)
                    .locked(false)
                    .build();

            userRepository.save(admin);

            log.info("Default admin user created: {}", adminEmail);
        }
    }
}