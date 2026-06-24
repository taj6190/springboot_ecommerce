package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Tag Entity
 *
 * Represents labels used to categorize and filter products dynamically.
 *
 * Tags are used for:
 * - Product filtering
 * - Search optimization
 * - Recommendation systems
 *
 * Example: "New Arrival", "Sale", "Popular"
 */
@Entity
@Table(name = "tags", indexes = {
        @Index(name = "idx_tag_name", columnList = "name", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tag {

    /**
     * Unique identifier for the tag.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * Display name of the tag.
     * Must be unique across the system.
     */
    @Column(nullable = false, unique = true, length = 100)
    private String name;

    /**
     * SEO-friendly version of tag name used in URLs or filtering.
     */
    @Column(length = 120)
    private String slug;
}