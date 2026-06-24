package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * HomepageSection Entity
 *
 * Represents configurable sections on the homepage such as:
 * - Featured products
 * - Trending products
 * - Promotional banners
 * - Category highlights
 *
 * The `config` field stores JSON-based configuration
 * to allow dynamic rendering without code changes.
 */
@Entity
@Table(name = "homepage_sections")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HomepageSection extends BaseEntity {

    /**
     * Type of homepage section.
     * Example: FEATURED, TRENDING, BANNER, CATEGORY_HIGHLIGHT
     */
    @Column(nullable = false, length = 50)
    private String sectionType;

    /**
     * Section title in English (UI display text).
     */
    @Column(length = 200)
    private String titleEn;

    /**
     * Section title in Bengali (localized UI support).
     */
    @Column(length = 200)
    private String titleBn;

    /**
     * Determines ordering of sections on homepage.
     * Lower value appears first.
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    /**
     * JSON configuration for dynamic rendering.
     * Can include filters, product IDs, API settings, etc.
     */
    @Column(columnDefinition = "TEXT")
    private String config;

    /**
     * Indicates whether this section is active and visible on homepage.
     */
    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}