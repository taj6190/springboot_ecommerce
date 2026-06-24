package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * StaticPage Entity
 *
 * Represents CMS-style static content pages such as:
 * - About Us
 * - Privacy Policy
 * - Terms & Conditions
 * - Return Policy
 *
 * These pages are typically managed from admin panel
 * and rendered dynamically in the frontend.
 */
@Entity
@Table(name = "static_pages", indexes = {
        @Index(name = "idx_static_page_slug", columnList = "slug", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaticPage extends BaseEntity {

    /**
     * Unique SEO-friendly identifier for the page URL.
     * Example: /pages/privacy-policy
     */
    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    /**
     * Page title in English (primary language).
     */
    @Column(nullable = false, length = 200)
    private String titleEn;

    /**
     * Page title in Bengali (localized version).
     */
    @Column(length = 200)
    private String titleBn;

    /**
     * Full HTML/content body in English.
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String contentEn;

    /**
     * Full HTML/content body in Bengali.
     */
    @Column(columnDefinition = "TEXT")
    private String contentBn;

    /**
     * Page classification type (e.g., LEGAL, INFO, POLICY).
     */
    @Column(length = 50)
    private String pageType;

    /**
     * Indicates whether the page is published and visible publicly.
     */
    @Column(nullable = false)
    @Builder.Default
    private boolean published = true;
}