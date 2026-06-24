package com.ecommerce.backend.dto.product;

import lombok.Data;

/**
 * Request DTO for creating or updating a product FAQ entry.
 */
@Data
public class ProductFaqRequest {

    /** The FAQ question text. */
    private String question;

    /** The FAQ answer text. */
    private String answer;

    /** The display order for sorting FAQs on the product page. */
    private Integer displayOrder;
}
