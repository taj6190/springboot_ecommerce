package com.ecommerce.backend.dto.brand;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Response DTO representing a brand in API responses.
 * Contains all public brand details returned to the client.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrandResponse {

    /** The unique identifier of the brand. */
    private UUID id;

    /** The brand name in English. */
    private String nameEn;

    /** The brand name in Bengali. */
    private String nameBn;

    /** The URL-friendly slug generated from the brand name. */
    private String slug;

    /** URL of the brand's logo image. */
    private String logoUrl;

    /** A brief description of the brand. */
    private String description;

    /** Whether the brand is currently active and visible. */
    private boolean active;
}
