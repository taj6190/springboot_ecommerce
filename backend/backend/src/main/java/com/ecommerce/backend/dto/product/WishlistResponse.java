package com.ecommerce.backend.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishlistResponse {
    private UUID id;
    private UUID productId;
    private String nameEn;
    private String nameBn;
    private String urlSlug;
    private BigDecimal mainPrice;
    private BigDecimal discountPrice;
    private String primaryImageUrl;
    private boolean inStock;
    private Instant addedAt;
}
