package com.ecommerce.backend.dto.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Request DTO for creating or updating a product variant.
 * Represents a specific variation of a product (e.g., size, color, material).
 */
@Data
public class ProductVariantRequest {

    /** The variant ID. Null for creating a new variant, present for updating an existing one. */
    private UUID id;

    /** The unique SKU code for this variant. Required. */
    @NotBlank(message = "Variant SKU is required")
    private String sku;

    /** The size attribute of this variant (e.g., "S", "M", "L", "XL"). Optional. */
    private String size;

    /** The color attribute of this variant (e.g., "Red", "Blue"). Optional. */
    private String color;

    /** The material attribute of this variant (e.g., "Cotton", "Polyester"). Optional. */
    private String material;

    /** The weight of this variant (e.g., "500g", "1.2kg"). Optional. */
    private String weight;

    /** The selling price for this variant. Required, must be greater than 0. */
    @NotNull(message = "Variant price is required")
    @DecimalMin(value = "0.01")
    private BigDecimal price;

    /** The discounted price for this variant. Optional. */
    private BigDecimal discountPrice;

    /** The available stock quantity for this variant. Required, cannot be negative. */
    @NotNull(message = "Variant stock is required")
    @Min(value = 0)
    private Integer stockQuantity;

    /** Whether this variant is active and purchasable. Optional. */
    private Boolean active;

    /** The image URL specific to this variant. Optional. */
    private String imageUrl;
}
