package com.ecommerce.backend.dto.product;

import com.ecommerce.backend.entity.ProductSpecification;
import com.ecommerce.backend.enums.ProductStatus;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Request DTO for creating or updating a product.
 * Contains all product details including localized info, pricing, stock, SEO, media, variants, and FAQs.
 */
@Data
public class ProductRequest {

    /** The product name in English. Required, max 300 characters. */
    @NotBlank(message = "English product name is required")
    @Size(max = 300)
    private String nameEn;

    /** The product name in Bengali. Optional, max 300 characters. */
    @Size(max = 300)
    private String nameBn;

    /** Short description in English for product cards and previews. */
    private String shortDescEn;

    /** Short description in Bengali. */
    private String shortDescBn;

    /** Full/long description in English for the product detail page. */
    private String longDescEn;

    /** Full/long description in Bengali. */
    private String longDescBn;

    /** The unique Stock Keeping Unit code. Required, max 100 characters. */
    @NotBlank(message = "SKU is required")
    @Size(max = 100)
    private String sku;

    /** The main selling price of the product. Required, must be greater than 0. */
    @NotNull(message = "Main price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal mainPrice;

    /** The discounted price if a promotion is active. Optional. */
    private BigDecimal discountPrice;

    /** The cost/purchase price for internal margin calculations. Optional. */
    private BigDecimal costPrice;

    /** The current stock quantity available. Required, cannot be negative. */
    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock cannot be negative")
    private Integer stockQuantity;

    /** The minimum stock level before triggering a low-stock warning. Optional. */
    private Integer lowStockThreshold;

    /** The ID of the category this product belongs to. Optional. */
    private UUID categoryId;

    /** The ID of the brand this product belongs to. Optional. */
    private UUID brandId;

    /** The type of the product (e.g., "physical", "digital"). Optional. */
    private String productType;

    /** Whether the product should be featured on the homepage. Optional. */
    private Boolean featured;

    /** Whether the product is currently trending. Optional. */
    private Boolean trending;

    /** Whether the product is a best seller. Optional. */
    private Boolean bestSeller;

    /** The publication status of the product (e.g., ACTIVE, DRAFT, ARCHIVED). Optional. */
    private ProductStatus status;

    /** The SEO meta title for search engine results. Optional. */
    private String seoTitle;

    /** The SEO meta description for search engine results. Optional. */
    private String seoDescription;

    /** A custom URL slug for the product page. Optional. */
    private String urlSlug;

    /** Comma-separated meta keywords for SEO. Optional. */
    private String metaKeywords;

    /** Whether a flash sale is currently active for this product. Optional. */
    private Boolean flashSaleActive;

    /** The start time of the flash sale period. Optional. */
    private Instant saleStartTime;

    /** The end time of the flash sale period. Optional. */
    private Instant saleEndTime;

    /** The main/primary image URL for the product. Optional. */
    private String mainImageUrl;

    /** The list of additional product images for the gallery. Optional. */
    private List<ProductImageRequest> images;

    /** The set of tag names to associate with this product. Optional. */
    private Set<String> tags;

    /** The list of product variants (e.g., different sizes/colors). Optional. */
    private List<ProductVariantRequest> variants;

    /** The list of frequently asked questions for this product. Optional. */
    private List<ProductFaqRequest> faqs;

    /** The list of technical specifications for this product. Optional. */
    private List<ProductSpecification> specifications;

    /** The set of product IDs to suggest as cross-sell recommendations. Optional. */
    private Set<UUID> crossSellProductIds;

    /** The set of product IDs to suggest as up-sell recommendations. Optional. */
    private Set<UUID> upSellProductIds;
}
