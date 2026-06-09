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

@Data
public class ProductRequest {

    // --- Basic Info ---
    @NotBlank(message = "English product name is required")
    @Size(max = 300)
    private String nameEn;

    @Size(max = 300)
    private String nameBn;

    private String shortDescEn;
    private String shortDescBn;
    private String longDescEn;
    private String longDescBn;

    // --- SKU & Pricing ---
    @NotBlank(message = "SKU is required")
    @Size(max = 100)
    private String sku;

    @NotNull(message = "Main price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal mainPrice;

    private BigDecimal discountPrice;
    private BigDecimal costPrice;

    // --- Stock ---
    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock cannot be negative")
    private Integer stockQuantity;

    private Integer lowStockThreshold;

    // --- Categorization ---
    private UUID categoryId;
    private UUID brandId;
    private String productType;

    // --- Flags ---
    private Boolean featured;
    private Boolean trending;
    private Boolean bestSeller;

    // --- Status ---
    private ProductStatus status;

    // --- SEO ---
    private String seoTitle;
    private String seoDescription;
    private String urlSlug;
    private String metaKeywords;

    // --- Flash Sale ---
    private Boolean flashSaleActive;
    private Instant saleStartTime;
    private Instant saleEndTime;

    // --- Media ---
    private String mainImageUrl;
    private List<ProductImageRequest> images;

    // --- Tags ---
    private Set<String> tags;

    // --- Variants ---
    private List<ProductVariantRequest> variants;

    // --- FAQs ---
    private List<ProductFaqRequest> faqs;

    // --- Specifications ---
    private List<ProductSpecification> specifications;

    // --- Cross-sell/Upsell ---
    private Set<UUID> crossSellProductIds;
    private Set<UUID> upSellProductIds;
}
