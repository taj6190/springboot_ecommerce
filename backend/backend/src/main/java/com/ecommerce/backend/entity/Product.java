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
 * Product Entity
 *
 * Core entity of the e-commerce system.
 *
 * Represents a sellable product with:
 * - Multilingual content (English/Bengali)
 * - Pricing & stock management
 * - SEO optimization
 * - Variants and media
 * - Flash sale support
 * - Customer engagement metrics
 * - Cross-sell / Upsell relationships
 *
 * This is one of the most complex and central entities in the system.
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

    // ---------------- BASIC INFORMATION ----------------

    /**
     * Product name in English (primary language for UI).
     */
    @Column(nullable = false, length = 300)
    private String nameEn;

    /**
     * Product name in Bengali (localized support).
     */
    @Column(length = 300)
    private String nameBn;

    /**
     * Short description in English (used in listings/cards).
     */
    @Column(columnDefinition = "TEXT")
    private String shortDescEn;

    /**
     * Short description in Bengali.
     */
    @Column(columnDefinition = "TEXT")
    private String shortDescBn;

    /**
     * Full detailed description in English.
     */
    @Column(columnDefinition = "TEXT")
    private String longDescEn;

    /**
     * Full detailed description in Bengali.
     */
    @Column(columnDefinition = "TEXT")
    private String longDescBn;

    // ---------------- IDENTIFICATION & PRICING ----------------

    /**
     * Stock Keeping Unit (SKU) - unique product identifier.
     */
    @Column(nullable = false, unique = true, length = 100)
    private String sku;

    /**
     * Main selling price of the product.
     */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal mainPrice;

    /**
     * Discounted price (if applicable).
     */
    @Column(precision = 12, scale = 2)
    private BigDecimal discountPrice;

    /**
     * Internal cost price (used for profit calculation).
     */
    @Column(precision = 12, scale = 2)
    private BigDecimal costPrice;

    // ---------------- STOCK MANAGEMENT ----------------

    /**
     * Available stock quantity.
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer stockQuantity = 0;

    /**
     * Threshold to trigger low-stock warnings.
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer lowStockThreshold = 5;

    // ---------------- CATEGORIZATION ----------------

    /**
     * Category to which this product belongs.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    /**
     * Brand of the product.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    private Brand brand;

    /**
     * Optional product type classification.
     */
    @Column(length = 100)
    private String productType;

    // ---------------- FEATURE FLAGS ----------------

    /**
     * Marks product as featured for homepage display.
     */
    @Column(nullable = false)
    @Builder.Default
    private boolean featured = false;

    /**
     * Marks product as trending.
     */
    @Column(nullable = false)
    @Builder.Default
    private boolean trending = false;

    /**
     * Marks product as best seller.
     */
    @Column(nullable = false)
    @Builder.Default
    private boolean bestSeller = false;

    // ---------------- STATUS ----------------

    /**
     * Current lifecycle status of the product.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ProductStatus status = ProductStatus.DRAFT;

    // ---------------- SEO ----------------

    /**
     * SEO title for search engines.
     */
    @Column(length = 300)
    private String seoTitle;

    /**
     * SEO description for search engines.
     */
    @Column(length = 500)
    private String seoDescription;

    /**
     * Unique URL slug for product pages.
     */
    @Column(nullable = false, unique = true, length = 350)
    private String urlSlug;

    /**
     * Meta keywords for SEO optimization.
     */
    @Column(length = 500)
    private String metaKeywords;

    // ---------------- FLASH SALE ----------------

    /**
     * Indicates if product is in flash sale.
     */
    @Column(nullable = false)
    @Builder.Default
    private boolean flashSaleActive = false;

    /**
     * Flash sale start time.
     */
    private Instant saleStartTime;

    /**
     * Flash sale end time.
     */
    private Instant saleEndTime;

    // ---------------- CUSTOMER ENGAGEMENT ----------------

    /**
     * Average customer rating for the product.
     */
    @Column(nullable = false, precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal avgRating = BigDecimal.ZERO;

    /**
     * Total number of reviews.
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer reviewCount = 0;

    /**
     * Number of times added to wishlist.
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer wishlistCount = 0;

    // ---------------- MEDIA ----------------

    /**
     * Primary product image URL.
     */
    private String mainImageUrl;

    // ---------------- OPTIMISTIC LOCKING ----------------

    /**
     * Used for optimistic locking to prevent concurrent update issues.
     */
    @Version
    private Long version;

    // ---------------- RELATIONS ----------------

    /**
     * Product variants (size, color, etc.).
     */
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductVariant> variants = new ArrayList<>();

    /**
     * Product images gallery.
     */
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<ProductImage> images = new ArrayList<>();

    /**
     * Tags associated with this product.
     */
    @ManyToMany
    @JoinTable(
            name = "product_tags",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    @Builder.Default
    private Set<Tag> tags = new HashSet<>();

    /**
     * Frequently asked questions for product.
     */
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductFaq> faqs = new ArrayList<>();

    /**
     * Product specifications stored as key-value pairs.
     */
    @ElementCollection
    @CollectionTable(name = "product_specifications", joinColumns = @JoinColumn(name = "product_id"))
    @Builder.Default
    private List<ProductSpecification> specifications = new ArrayList<>();

    // ---------------- CROSS SELL / UP SELL ----------------

    /**
     * Products suggested as cross-sell items.
     */
    @ManyToMany
    @JoinTable(
            name = "product_cross_sell",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "cross_sell_product_id")
    )
    @Builder.Default
    private Set<Product> crossSellProducts = new HashSet<>();

    /**
     * Products suggested as upsell items.
     */
    @ManyToMany
    @JoinTable(
            name = "product_upsell",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "upsell_product_id")
    )
    @Builder.Default
    private Set<Product> upSellProducts = new HashSet<>();

    // ---------------- HELPER METHODS ----------------

    /**
     * Adds a product variant and maintains bidirectional relationship.
     */
    public void addVariant(ProductVariant variant) {
        variants.add(variant);
        variant.setProduct(this);
    }

    /**
     * Removes a product variant safely.
     */
    public void removeVariant(ProductVariant variant) {
        variants.remove(variant);
        variant.setProduct(null);
    }

    /**
     * Adds an image and maintains relationship consistency.
     */
    public void addImage(ProductImage image) {
        images.add(image);
        image.setProduct(this);
    }

    /**
     * Removes an image safely.
     */
    public void removeImage(ProductImage image) {
        images.remove(image);
        image.setProduct(null);
    }
}