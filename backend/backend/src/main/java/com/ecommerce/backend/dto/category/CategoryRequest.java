package com.ecommerce.backend.dto.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

/**
 * Request DTO for creating or updating a product category.
 * Supports localized names/descriptions and hierarchical parent-child relationships.
 */
@Data
public class CategoryRequest {

    /** The category name in English. Required, max 200 characters. */
    @NotBlank(message = "English name is required")
    @Size(max = 200)
    private String nameEn;

    /** The category name in Bengali. Optional, max 200 characters. */
    @Size(max = 200)
    private String nameBn;

    /** The category description in English. Optional. */
    private String descriptionEn;

    /** The category description in Bengali. Optional. */
    private String descriptionBn;

    /** URL of the category image. Optional. */
    private String imageUrl;

    /** The ID of the parent category for creating subcategories. Null for top-level categories. */
    private UUID parentId;

    /** The display order for sorting categories in listings. Optional. */
    private Integer displayOrder;

    /** Whether the category is currently active and visible. Optional. */
    private Boolean active;
}
