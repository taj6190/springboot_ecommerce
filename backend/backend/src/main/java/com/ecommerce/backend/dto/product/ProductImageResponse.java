package com.ecommerce.backend.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Response DTO representing a product image in API responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductImageResponse {

    /** The unique identifier of the product image. */
    private UUID id;

    /** The URL of the product image. */
    private String imageUrl;

    /** Alternative text for the image, used for accessibility and SEO. */
    private String altText;

    /** The display order for sorting images in the product gallery. */
    private Integer displayOrder;

    /** Whether this is the main/primary image shown in product listings. */
    private boolean isMain;
}
