package com.ecommerce.backend.dto.product;

import com.ecommerce.backend.entity.ProductSpecification;
import com.ecommerce.backend.enums.ProductStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Response DTO representing a full product detail in API responses.
 * Contains all product information including pricing, stock, SEO, media, variants, FAQs, and audit data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {

    /** The unique identifier of the product. */
    private UUID id;

    /** The product name in English. */
    private String nameEn;

    /** The product name in Bengali. */
    private String nameBn;

    /** Short description in English. */
    private String shortDescEn;

    /** Short description in Bengali. */
    private String shortDescBn;

    /** Full/long description in English. */
    private String longDescEn;

    /** Full/long description in Bengali. */
    private String longDescBn;

    /** The unique SKU code of the product. */
    private String sku;

    /** The main selling price. */
    private BigDecimal mainPrice;

    /** The discounted price, if applicable. */
    private BigDecimal discountPrice;

    /** The cost/purchase price for internal use. */
    private BigDecimal costPrice;

    /** The current stock quantity available. */
    private Integer stockQuantity;

    /** The low-stock warning threshold. */
    private Integer lowStockThreshold;

    /** The ID of the category this product belongs to. */
    private UUID categoryId;

    /** The name of the product's category. */
    private String categoryName;

    /** The ID of the brand this product belongs to. */
    private UUID brandId;

    /** The name of the product's brand. */
    private String brandName;

    /** The product type (e.g., "physical", "digital"). */
    private String productType;

    /** Whether the product is featured on the homepage. */
    private boolean featured;

    /** Whether the product is currently trending. */
    private boolean trending;

    /** Whether the product is a best seller. */
    private boolean bestSeller;

    /** The publication status of the product. */
    private ProductStatus status;

    /** The SEO meta title. */
    private String seoTitle;

    /** The SEO meta description. */
    private String seoDescription;

    /** The URL slug for the product page. */
    private String urlSlug;

    /** Comma-separated meta keywords for SEO. */
    private String metaKeywords;

    /** Whether a flash sale is currently active. */
    private boolean flashSaleActive;

    /** The start time of the flash sale period. */
    private Instant saleStartTime;

    /** The end time of the flash sale period. */
    private Instant saleEndTime;

    /** The average customer rating (e.g., 4.5 out of 5). */
    private BigDecimal avgRating;

    /** The total number of customer reviews. */
    private Integer reviewCount;

    /** The total number of times the product has been wishlisted. */
    private Integer wishlistCount;

    /** The main/primary image URL. */
    private String mainImageUrl;

    /** The list of additional product images. */
    private List<ProductImageResponse> images;

    /** The list of product variants (sizes, colors, etc.). */
    private List<ProductVariantResponse> variants;

    /** The set of tag names associated with this product. */
    private Set<String> tags;

    /** The list of frequently asked questions. */
    private List<ProductFaqResponse> faqs;

    /** The list of technical specifications. */
    private List<ProductSpecification> specifications;

    /** The username or email of the user who created this product. */
    private String createdBy;

    /** The username or email of the user who last updated this product. */
    private String updatedBy;

    /** The timestamp when the product was created. */
    private Instant createdAt;

    /** The timestamp when the product was last updated. */
    private Instant updatedAt;

    /** The optimistic locking version number. */
    private Long version;
}
