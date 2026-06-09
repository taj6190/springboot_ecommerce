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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {

    private UUID id;
    private String nameEn;
    private String nameBn;
    private String shortDescEn;
    private String shortDescBn;
    private String longDescEn;
    private String longDescBn;
    private String sku;
    private BigDecimal mainPrice;
    private BigDecimal discountPrice;
    private BigDecimal costPrice;
    private Integer stockQuantity;
    private Integer lowStockThreshold;

    // Category & Brand
    private UUID categoryId;
    private String categoryName;
    private UUID brandId;
    private String brandName;
    private String productType;

    // Flags
    private boolean featured;
    private boolean trending;
    private boolean bestSeller;
    private ProductStatus status;

    // SEO
    private String seoTitle;
    private String seoDescription;
    private String urlSlug;
    private String metaKeywords;

    // Flash Sale
    private boolean flashSaleActive;
    private Instant saleStartTime;
    private Instant saleEndTime;

    // Engagement
    private BigDecimal avgRating;
    private Integer reviewCount;
    private Integer wishlistCount;

    // Media
    private String mainImageUrl;
    private List<ProductImageResponse> images;

    // Variants
    private List<ProductVariantResponse> variants;

    // Tags
    private Set<String> tags;

    // FAQs
    private List<ProductFaqResponse> faqs;

    // Specifications
    private List<ProductSpecification> specifications;

    // Audit
    private String createdBy;
    private String updatedBy;
    private Instant createdAt;
    private Instant updatedAt;
    private Long version;
}
