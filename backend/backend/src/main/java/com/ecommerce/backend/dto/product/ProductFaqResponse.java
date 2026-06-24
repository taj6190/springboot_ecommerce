package com.ecommerce.backend.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Response DTO representing a product FAQ entry in API responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductFaqResponse {

    /** The unique identifier of the FAQ entry. */
    private UUID id;

    /** The FAQ question text. */
    private String question;

    /** The FAQ answer text. */
    private String answer;

    /** The display order for sorting FAQs on the product page. */
    private Integer displayOrder;
}
