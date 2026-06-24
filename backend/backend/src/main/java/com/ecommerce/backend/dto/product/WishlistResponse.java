package com.ecommerce.backend.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * WishlistResponse DTO
 *
 * Represents a product item stored in a user's wishlist.
 *
 * Used for:
 * - Displaying wishlist items in frontend
 * - Showing product summary without full entity exposure
 * - Optimized lightweight API response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishlistResponse {

    /**
     * Wishlist entry ID.
     */
    private UUID id;

    /**
     * Associated product ID.
     */
    private UUID productId;

    /**
     * Product name in English.
     */
    private String nameEn;

    /**
     * Product name in Bengali.
     */
    private String nameBn;

    /**
     * SEO-friendly product URL slug.
     */
    private String urlSlug;

    /**
     * Main selling price of the product.
     */
    private BigDecimal mainPrice;

    /**
     * Discounted price (if available).
     */
    private BigDecimal discountPrice;

    /**
     * Primary image URL for product preview.
     */
    private String primaryImageUrl;

    /**
     * Indicates whether product is currently in stock.
     */
    private boolean inStock;

    /**
     * Timestamp when product was added to wishlist.
     */
    private Instant addedAt;
}