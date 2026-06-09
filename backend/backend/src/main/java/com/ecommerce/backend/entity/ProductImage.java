package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Product image entity for main + gallery images.
 */
@Entity
@Table(name = "product_images", indexes = {
        @Index(name = "idx_image_product", columnList = "product_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImage extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id")
    private ProductVariant variant;

    @Column(nullable = false)
    private String imageUrl;

    @Column(length = 300)
    private String altText;

    @Column(nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(nullable = false)
    @Builder.Default
    private boolean isMain = false;
}
