package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * FAQ/Q&A section for products.
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String question;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String answer;

    @Column(nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;
}
