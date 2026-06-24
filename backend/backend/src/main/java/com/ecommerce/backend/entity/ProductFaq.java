package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * ProductFaq Entity
 *
 * Represents Frequently Asked Questions (FAQ) for a product.
 *
 * Helps improve user experience by answering common customer queries
 * directly on the product detail page.
 */
@Entity
@Table(name = "product_faqs", indexes = {
        @Index(name = "idx_faq_product", columnList = "product_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductFaq extends BaseEntity {

    /**
     * Product associated with this FAQ.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /**
     * FAQ question text.
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String question;

    /**
     * Answer to the FAQ question.
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String answer;

    /**
     * Determines the display order of FAQs on product page.
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;
}