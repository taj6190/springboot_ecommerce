package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Brand Entity
 *
 * Represents a product brand in the system.
 * Used to group and organize products under a specific brand identity.
 *
 * Examples: Samsung, Apple, Xiaomi, etc.
 */
@Entity
@Table(name = "brands", indexes = {
        @Index(name = "idx_brand_slug", columnList = "slug", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Brand extends BaseEntity {

    /**
     * Brand name in English.
     * This is the primary display name used in most UI components.
     */
    @Column(nullable = false, length = 200)
    private String nameEn;

    /**
     * Brand name in Bengali (Bangla).
     * Useful for localized UI support.
     */
    @Column(length = 200)
    private String nameBn;

    /**
     * SEO-friendly unique identifier for the brand.
     * Used in URLs (e.g., /brands/samsung).
     */
    @Column(nullable = false, unique = true, length = 250)
    private String slug;

    /**
     * URL of the brand logo image.
     * Can be stored in cloud storage or CDN.
     */
    private String logoUrl;

    /**
     * Detailed description of the brand.
     * Stored as TEXT to allow long-form content.
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Indicates whether the brand is active or disabled.
     * Inactive brands may be hidden from the storefront.
     */
    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}