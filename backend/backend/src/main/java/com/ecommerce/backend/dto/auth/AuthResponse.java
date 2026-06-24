package com.ecommerce.backend.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

/**
 * Response DTO returned after successful authentication (login or token refresh).
 * Contains JWT tokens and basic user information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    /** The JWT access token used for authenticating subsequent API requests. */
    private String accessToken;

    /** The refresh token used to obtain a new access token when the current one expires. */
    private String refreshToken;

    /** The token type (typically "Bearer"). */
    private String tokenType;

    /** The authenticated user's email address. */
    private String email;

    /** The authenticated user's full name. */
    private String fullName;

    /** The set of role names assigned to the authenticated user (e.g., "ROLE_ADMIN", "ROLE_CUSTOMER"). */
    private Set<String> roles;
}
