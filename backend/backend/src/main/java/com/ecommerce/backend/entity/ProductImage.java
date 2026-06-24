package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * ProductImage Entity
 *
 * Represents images associated with a product.
 *
 * Supports:
 * - Main product image
 * - Gallery images
 * - Variant-specific images (e.g., color/size-specific)
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

    /**
     * Product to which this image belongs.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /**
     * Optional variant association (e.g., specific color/size image).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id")
    private ProductVariant variant;

    /**
     * URL of the image stored in CDN or storage service.
     */
    @Column(nullable = false)
    private String imageUrl;

    /**
     * Alternative text for accessibility and SEO purposes.
     */
    @Column(length = 300)
    private String altText;

    /**
     * Defines display order in product gallery.
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    /**
     * Indicates whether this is the primary product image.
     */
    @Column(nullable = false)
    @Builder.Default
    private boolean isMain = false;
}