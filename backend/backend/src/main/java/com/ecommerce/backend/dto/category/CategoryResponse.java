package com.ecommerce.backend.dto.category;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * Response DTO representing a product category in API responses.
 * Supports hierarchical structure via the children list for nested category trees.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {

    /** The unique identifier of the category. */
    private UUID id;

    /** The category name in English. */
    private String nameEn;

    /** The category name in Bengali. */
    private String nameBn;

    /** The URL-friendly slug generated from the category name. */
    private String slug;

    /** The category description in English. */
    private String descriptionEn;

    /** The category description in Bengali. */
    private String descriptionBn;

    /** URL of the category image. */
    private String imageUrl;

    /** The ID of the parent category. Null for root-level categories. */
    private UUID parentId;

    /** The name of the parent category for display purposes. */
    private String parentName;

    /** The display order for sorting categories. */
    private Integer displayOrder;

    /** Whether the category is currently active and visible. */
    private boolean active;

    /** The depth level of the category in the hierarchy (0 = root). */
    private Integer level;

    /** The list of child subcategories, forming a recursive tree structure. */
    private List<CategoryResponse> children;
}
