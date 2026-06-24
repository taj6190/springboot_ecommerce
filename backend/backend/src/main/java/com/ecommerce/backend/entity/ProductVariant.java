package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * ProductVariant Entity
 *
 * Represents a specific variation of a product such as:
 * - Size (S, M, L, XL)
 * - Color (Red, Black, Blue)
 * - Material (Cotton, Leather, etc.)
 *
 * Each variant has its own:
 * - SKU
 * - Price
 * - Stock
 * - Optional images
 *
 * This allows fine-grained inventory and pricing control per variant.
 */
@Entity
@Table(name = "product_variants", indexes = {
        @Index(name = "idx_variant_sku", columnList = "sku", unique = true),
        @Index(name = "idx_variant_product", columnList = "product_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant extends BaseEntity {

    /**
     * Parent product this variant belongs to.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /**
     * Unique SKU for this specific variant.
     */
    @Column(nullable = false, unique = true, length = 100)
    private String sku;

    /**
     * Size attribute (e.g., S, M, L, XL).
     */
    @Column(length = 100)
    private String size;

    /**
     * Color attribute of the variant.
     */
    @Column(length = 100)
    private String color;

    /**
     * Material type (e.g., Cotton, Leather).
     */
    @Column(length = 100)
    private String material;

    /**
     * Weight specification of the variant.
     */
    @Column(length = 50)
    private String weight;

    /**
     * Selling price for this variant.
     */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    /**
     * Discounted price for this variant (if applicable).
     */
    @Column(precision = 12, scale = 2)
    private BigDecimal discountPrice;

    /**
     * Available stock quantity for this variant.
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer stockQuantity = 0;

    /**
     * Indicates whether this variant is active and available for purchase.
     */
    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    /**
     * Primary image URL for this variant.
     */
    private String imageUrl;

    /**
     * Additional images specific to this variant.
     */
    @OneToMany(mappedBy = "variant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductImage> images = new ArrayList<>();

    /**
     * Optimistic locking version field to prevent concurrent update conflicts.
     */
    @Version
    private Long version;
}