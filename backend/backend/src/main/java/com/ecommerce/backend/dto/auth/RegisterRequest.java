package com.ecommerce.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request DTO for new user registration.
 * Contains personal details and credentials for creating a customer account.
 */
@Data
public class RegisterRequest {

    /** The user's full name. Required, max 100 characters. */
    @NotBlank(message = "Full name is required")
    @Size(max = 100)
    private String fullName;

    /** The user's email address. Required, must be a valid email format. */
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    /** The user's password. Required, must be between 6 and 100 characters. */
    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    private String password;

    /** The user's phone number. Optional, max 20 characters. */
    @Size(max = 20)
    private String phone;

    /** The user's street address. Optional. */
    private String address;

    /** The user's city. Optional. */
    private String city;

    /** The user's district or state. Optional. */
    private String district;

    /** The user's postal/zip code. Optional. */
    private String postalCode;
}
