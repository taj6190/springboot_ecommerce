package com.ecommerce.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request DTO for refreshing an expired JWT access token.
 */
@Data
public class RefreshTokenRequest {

    /** The refresh token issued during the last successful authentication. Must not be blank. */
    @NotBlank(message = "Refresh token is required")
    private String refreshToken;
}
