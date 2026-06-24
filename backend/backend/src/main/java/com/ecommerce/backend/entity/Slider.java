package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Slider Entity
 *
 * Represents homepage banners/sliders used for promotions and announcements.
 *
 * Typically displayed in the homepage carousel section.
 * Supports scheduling, localization, and ordering.
 */
@Entity
@Table(name = "sliders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Slider extends BaseEntity {

    /**
     * Title in English.
     */
    @Column(length = 200)
    private String titleEn;

    /**
     * Title in Bengali (localized display).
     */
    @Column(length = 200)
    private String titleBn;

    /**
     * Subtitle in English for additional context.
     */
    @Column(length = 300)
    private String subtitleEn;

    /**
     * Subtitle in Bengali.
     */
    @Column(length = 300)
    private String subtitleBn;

    /**
     * Main banner image URL.
     */
    @Column(nullable = false)
    private String imageUrl;

    /**
     * Optional redirect URL when slider is clicked.
     */
    @Column(length = 500)
    private String linkUrl;

    /**
     * Display order for carousel positioning.
     * Lower value appears first.
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    /**
     * Indicates whether this slider is active and visible.
     */
    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    /**
     * Start date for scheduled visibility.
     */
    private Instant startDate;

    /**
     * End date for scheduled visibility.
     */
    private Instant endDate;
}