package com.ecommerce.backend.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantResponse {
    private UUID id;
    private String sku;
    private String size;
    private String color;
    private String material;
    private String weight;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private Integer stockQuantity;
    private boolean active;
    private String imageUrl;
}
