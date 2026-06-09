package com.ecommerce.backend.dto.product;

import lombok.Data;

@Data
public class ProductImageRequest {
    private String imageUrl;
    private String altText;
    private int displayOrder;
    private boolean isMain;
}
