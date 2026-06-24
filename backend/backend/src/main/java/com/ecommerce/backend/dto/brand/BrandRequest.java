package com.ecommerce.backend.dto.brand;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request DTO for creating or updating a brand.
 * Contains localized brand information and metadata.
 */
@Data
public class BrandRequest {

    /** The brand name in English. Required, max 200 characters. */
    @NotBlank(message = "English name is required")
    @Size(max = 200)
    private String nameEn;

    /** The brand name in Bengali. Optional, max 200 characters. */
    @Size(max = 200)
    private String nameBn;

    /** URL of the brand's logo image. Optional. */
    private String logoUrl;

    /** A brief description of the brand. Optional. */
    private String description;

    /** Whether the brand is currently active and visible. Optional. */
    private Boolean active;
}
