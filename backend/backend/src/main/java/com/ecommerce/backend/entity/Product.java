package com.ecommerce.backend.entity;

import com.ecommerce.backend.enums.ProductStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Main product entity with full e-commerce fields.
 * Supports bilingual content, variants, SEO, flash sales, and audit tracking.
 */
@Entity
@Table(name = "products", indexes = {
        @Index(name = "idx_product_slug", columnList = "urlSlug", unique = true),
        @Index(name = "idx_product_sku", columnList = "sku", unique = true),
        @Index(name = "idx_product_status", columnList = "status"),
        @Index(name = "idx_product_category", columnList = "category_id"),
        @Index(name = "idx_product_brand", columnList = "brand_id"),
        @Index(name = "idx_product_featured", columnList = "featured"),
        @Index(name = "idx_product_trending", columnList = "trending"),
        @Index(name = "idx_product_flash_sale", columnList = "flashSaleActive")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product extends BaseEntity {

    // --- Basic Info (Bilingual) ---
    @Column(nullable = false, length = 300)
    private String nameEn;

    @Column(length = 300)
    private String nameBn;

    @Column(columnDefinition = "TEXT")
    private String shortDescEn;

    @Column(columnDefinition = "TEXT")
    private String shortDescBn;

    @Column(columnDefinition = "TEXT")
    private String longDescEn;

    @Column(columnDefinition = "TEXT")
    private String longDescBn;

    // --- SKU & Pricing ---
    @Column(nullable = false, unique = true, length = 100)
    private String sku;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal mainPrice;

    @Column(precision = 12, scale = 2)
    private BigDecimal discountPrice;

    @Column(precision = 12, scale = 2)
    private BigDecimal costPrice;

    // --- Stock ---
    @Column(nullable = false)
    @Builder.Default
    private Integer stockQuantity = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer lowStockThreshold = 5;

    // --- Categorization ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @Column(length = 100)
    private String productType;

    // --- Flags ---
    @Column(nullable = false)
    @Builder.Default
    private boolean featured = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean trending = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean bestSeller = false;

    // --- Status ---
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ProductStatus status = ProductStatus.DRAFT;

    // --- SEO ---
    @Column(length = 300)
    private String seoTitle;

    @Column(length = 500)
    private String seoDescription;

    @Column(nullable = false, unique = true, length = 350)
    private String urlSlug;

    @Column(length = 500)
    private String metaKeywords;

    // --- Flash Sale ---
    @Column(nullable = false)
    @Builder.Default
    private boolean flashSaleActive = false;

    private Instant saleStartTime;
    private Instant saleEndTime;

    // --- Customer Engagement ---
    @Column(nullable = false, precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal avgRating = BigDecimal.ZERO;

    @Column(nullable = false)
    @Builder.Default
    private Integer reviewCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer wishlistCount = 0;

    // --- Media ---
    private String mainImageUrl;

    // --- Optimistic Locking ---
    @Version
    private Long version;

    // --- Relations ---
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductVariant> variants = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<ProductImage> images = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "product_tags",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    @Builder.Default
    private Set<Tag> tags = new HashSet<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductFaq> faqs = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "product_specifications", joinColumns = @JoinColumn(name = "product_id"))
    @Builder.Default
    private List<ProductSpecification> specifications = new ArrayList<>();

    // --- Cross-sell / Upsell ---
    @ManyToMany
    @JoinTable(
            name = "product_cross_sell",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "cross_sell_product_id")
    )
    @Builder.Default
    private Set<Product> crossSellProducts = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "product_upsell",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "upsell_product_id")
    )
    @Builder.Default
    private Set<Product> upSellProducts = new HashSet<>();

    // --- Helper Methods ---
    public void addVariant(ProductVariant variant) {
        variants.add(variant);
        variant.setProduct(this);
    }

    public void removeVariant(ProductVariant variant) {
        variants.remove(variant);
        variant.setProduct(null);
    }

    public void addImage(ProductImage image) {
        images.add(image);
        image.setProduct(this);
    }

    public void removeImage(ProductImage image) {
        images.remove(image);
        image.setProduct(null);
    }
}
