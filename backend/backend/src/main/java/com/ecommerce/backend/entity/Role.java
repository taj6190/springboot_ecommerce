package com.ecommerce.backend.entity;

import com.ecommerce.backend.enums.RoleName;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * Role Entity
 *
 * Represents user roles in the system for role-based access control (RBAC).
 *
 * Examples:
 * - ADMIN
 * - CUSTOMER
 * - MANAGER
 *
 * Each role can be assigned to multiple users.
 */
@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    /**
     * Unique identifier for the role.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * Name of the role (enum-based for consistency and safety).
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true, length = 30)
    private RoleName name;

    /**
     * Optional description of the role and its permissions.
     */
    @Column(length = 255)
    private String description;

    /**
     * Users assigned to this role.
     *
     * Many-to-Many relationship mapped from User entity.
     */
    @ManyToMany(mappedBy = "roles")
    @Builder.Default
    private Set<User> users = new HashSet<>();
}