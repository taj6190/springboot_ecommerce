package com.ecommerce.backend.dto.product;

import lombok.Data;

/**
 * Request DTO for creating or updating a product image.
 */
@Data
public class ProductImageRequest {

    /** The URL of the product image. */
    private String imageUrl;

    /** Alternative text for the image, used for accessibility and SEO. */
    private String altText;

    /** The display order for sorting images in the product gallery. */
    private int displayOrder;

    /** Whether this is the main/primary image shown in product listings. */
    private boolean isMain;
}
