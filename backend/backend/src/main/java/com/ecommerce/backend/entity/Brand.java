package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Brand entity for product organization.
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

    @Column(nullable = false, length = 200)
    private String nameEn;

    @Column(length = 200)
    private String nameBn;

    @Column(nullable = false, unique = true, length = 250)
    private String slug;

    private String logoUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
