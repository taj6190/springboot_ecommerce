package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * User Entity
 *
 * Represents system users including customers, admins, and staff.
 *
 * Handles authentication, authorization, profile data,
 * and account security features.
 */
@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_user_email", columnList = "email", unique = true),
        @Index(name = "idx_user_phone", columnList = "phone")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    /**
     * Full name of the user.
     */
    @Column(nullable = false, length = 100)
    private String fullName;

    /**
     * Unique email address used for login.
     */
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    /**
     * Encrypted password (never stored in plain text).
     */
    @Column(nullable = false)
    private String password;

    /**
     * Optional phone number for contact/verification.
     */
    @Column(length = 20)
    private String phone;

    /**
     * Full address of the user.
     */
    @Column(columnDefinition = "TEXT")
    private String address;

    /**
     * City of residence.
     */
    @Column(length = 100)
    private String city;

    /**
     * District of residence.
     */
    @Column(length = 100)
    private String district;

    /**
     * Postal/ZIP code.
     */
    @Column(length = 10)
    private String postalCode;

    /**
     * Indicates whether the account is enabled.
     */
    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = true;

    /**
     * Indicates whether the account is locked (e.g. security reasons).
     */
    @Column(nullable = false)
    @Builder.Default
    private boolean locked = false;

    /**
     * Profile image URL for user avatar.
     */
    private String profileImageUrl;

    /**
     * Roles assigned to the user for RBAC (e.g., ADMIN, CUSTOMER).
     */
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    /**
     * Refresh token used for JWT authentication renewal.
     */
    @Column(length = 500)
    private String refreshToken;

    /**
     * Expiry date of the refresh token.
     */
    private Instant refreshTokenExpiryDate;
}