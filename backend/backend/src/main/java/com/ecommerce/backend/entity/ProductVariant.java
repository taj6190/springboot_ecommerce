package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Product variant entity for size, color, material variations.
 * Each variant has its own SKU, price, and stock.
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, unique = true, length = 100)
    private String sku;

    @Column(length = 100)
    private String size;

    @Column(length = 100)
    private String color;

    @Column(length = 100)
    private String material;

    @Column(length = 50)
    private String weight;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(precision = 12, scale = 2)
    private BigDecimal discountPrice;

    @Column(nullable = false)
    @Builder.Default
    private Integer stockQuantity = 0;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    private String imageUrl;

    @OneToMany(mappedBy = "variant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductImage> images = new ArrayList<>();

    @Version
    private Long version;
}
