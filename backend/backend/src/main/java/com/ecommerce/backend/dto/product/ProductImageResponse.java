package com.ecommerce.backend.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductImageResponse {
    private UUID id;
    private String imageUrl;
    private String altText;
    private Integer displayOrder;
    private boolean isMain;
}
