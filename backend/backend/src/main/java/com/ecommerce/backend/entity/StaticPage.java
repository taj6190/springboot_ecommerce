package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Static pages: About Us, Privacy Policy, Terms & Conditions, etc.
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

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @Column(nullable = false, length = 200)
    private String titleEn;

    @Column(length = 200)
    private String titleBn;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contentEn;

    @Column(columnDefinition = "TEXT")
    private String contentBn;

    @Column(length = 50)
    private String pageType;

    @Column(nullable = false)
    @Builder.Default
    private boolean published = true;
}
