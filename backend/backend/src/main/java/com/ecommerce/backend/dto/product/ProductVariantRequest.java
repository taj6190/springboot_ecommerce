package com.ecommerce.backend.dto.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class ProductVariantRequest {

    private UUID id; // null for new, present for update

    @NotBlank(message = "Variant SKU is required")
    private String sku;

    private String size;
    private String color;
    private String material;
    private String weight;

    @NotNull(message = "Variant price is required")
    @DecimalMin(value = "0.01")
    private BigDecimal price;

    private BigDecimal discountPrice;

    @NotNull(message = "Variant stock is required")
    @Min(value = 0)
    private Integer stockQuantity;

    private Boolean active;

    private String imageUrl;
}
