package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Homepage section management (featured products, trending, banners, etc.)
 * Config field stores JSON configuration for dynamic section rendering.
 */
@Entity
@Table(name = "homepage_sections")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HomepageSection extends BaseEntity {

    @Column(nullable = false, length = 50)
    private String sectionType;

    @Column(length = 200)
    private String titleEn;

    @Column(length = 200)
    private String titleBn;

    @Column(nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(columnDefinition = "TEXT")
    private String config;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
