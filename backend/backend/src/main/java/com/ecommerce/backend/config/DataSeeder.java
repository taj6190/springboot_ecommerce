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
 * Seeds initial roles and default admin user on application startup.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.default-email}")
    private String adminEmail;

    @Value("${app.admin.default-password}")
    private String adminPassword;

    @Override
    @Transactional
    public void run(String... args) {
        seedRoles();
        seedAdminUser();
    }

    private void seedRoles() {
        for (RoleName roleName : RoleName.values()) {
            if (!roleRepository.existsByName(roleName)) {
                Role role = Role.builder()
                        .name(roleName)
                        .description(roleName.name().replace("ROLE_", "").replace("_", " "))
                        .build();
                roleRepository.save(role);
                log.info("Role created: {}", roleName);
            }
        }
    }

    private void seedAdminUser() {
        if (!userRepository.existsByEmail(adminEmail)) {
            Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Admin role not found"));

            User admin = User.builder()
                    .fullName("System Admin")
                    .email(adminEmail)
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
