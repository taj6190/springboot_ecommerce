package com.ecommerce.backend.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * ProductVariantResponse DTO
 *
 * Represents the response payload for product variant data
 * returned to the client (frontend/API consumers).
 *
 * This DTO is used to:
 * - Avoid exposing internal JPA entities
 * - Control API response structure
 * - Improve performance by sending only required fields
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantResponse {

    /**
     * Unique identifier of the variant.
     */
    private UUID id;

    /**
     * Stock Keeping Unit (SKU) for this variant.
     */
    private String sku;

    /**
     * Size attribute (e.g., S, M, L, XL).
     */
    private String size;

    /**
     * Color attribute of the variant.
     */
    private String color;

    /**
     * Material type of the variant.
     */
    private String material;

    /**
     * Weight information of the variant.
     */
    private String weight;

    /**
     * Original selling price of the variant.
     */
    private BigDecimal price;

    /**
     * Discounted price (if applicable).
     */
    private BigDecimal discountPrice;

    /**
     * Available stock quantity for this variant.
     */
    private Integer stockQuantity;

    /**
     * Indicates whether this variant is active and available for sale.
     */
    private boolean active;

    /**
     * Primary image URL for this variant.
     */
    private String imageUrl;
}