package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Category Entity
 *
 * Represents a hierarchical product category structure.
 *
 * Supports unlimited nesting levels:
 * Example:
 * Electronics → Mobile Phones → Smartphones
 *
 * This structure is implemented using a self-referencing relationship
 * (parent-child category model).
 */
@Entity
@Table(name = "categories", indexes = {
        @Index(name = "idx_category_slug", columnList = "slug", unique = true),
        @Index(name = "idx_category_parent", columnList = "parent_id"),
        @Index(name = "idx_category_active", columnList = "active")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category extends BaseEntity {

    /**
     * Category name in English (primary display language).
     */
    @Column(nullable = false, length = 200)
    private String nameEn;

    /**
     * Category name in Bengali (localized support).
     */
    @Column(length = 200)
    private String nameBn;

    /**
     * SEO-friendly unique identifier for category URLs.
     * Example: /categories/electronics
     */
    @Column(nullable = false, unique = true, length = 250)
    private String slug;

    /**
     * Detailed description in English.
     */
    @Column(columnDefinition = "TEXT")
    private String descriptionEn;

    /**
     * Detailed description in Bengali.
     */
    @Column(columnDefinition = "TEXT")
    private String descriptionBn;

    /**
     * Image URL representing the category (banner/icon).
     */
    private String imageUrl;

    /**
     * Parent category reference.
     * Null means this is a root category.
     *
     * LAZY loading is used to avoid unnecessary DB fetches.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parent;

    /**
     * List of child categories under this category.
     *
     * Cascade ALL ensures child categories are persisted/updated/deleted
     * along with the parent.
     *
     * OrphanRemoval ensures removed children are deleted from DB.
     */
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<Category> children = new ArrayList<>();

    /**
     * Defines ordering among sibling categories.
     * Lower value appears first in UI.
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    /**
     * Indicates whether category is active and visible in frontend.
     */
    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    /**
     * Depth level in category tree:
     * 0 = root
     * 1 = subcategory
     * 2 = sub-subcategory, etc.
     *
     * Useful for UI indentation and query optimization.
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer level = 0;
}