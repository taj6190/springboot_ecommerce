package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Hierarchical category entity.
 * Supports unlimited nesting: Category → Subcategory → Sub-subcategory
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

    @Column(nullable = false, length = 200)
    private String nameEn;

    @Column(length = 200)
    private String nameBn;

    @Column(nullable = false, unique = true, length = 250)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String descriptionEn;

    @Column(columnDefinition = "TEXT")
    private String descriptionBn;

    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<Category> children = new ArrayList<>();

    @Column(nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    /**
     * Depth level in the hierarchy (0 = root, 1 = subcategory, 2 = sub-subcategory, etc.)
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer level = 0;
}
