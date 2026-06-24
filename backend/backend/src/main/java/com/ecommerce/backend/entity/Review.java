package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Review Entity
 *
 * Represents customer reviews for products.
 *
 * Includes:
 * - Rating system
 * - Optional text comments
 * - Verification of purchase
 * - Admin approval workflow
 *
 * Helps improve trust and product credibility in the system.
 */
@Entity
@Table(name = "reviews", indexes = {
        @Index(name = "idx_review_product", columnList = "product_id"),
        @Index(name = "idx_review_user", columnList = "user_id"),
        @Index(name = "idx_review_approved", columnList = "approved")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review extends BaseEntity {

    /**
     * Product being reviewed.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /**
     * User who wrote the review.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Rating given by the user (e.g., 1 to 5 stars).
     */
    @Column(nullable = false)
    private Integer rating;

    /**
     * Optional review comment provided by the user.
     */
    @Column(columnDefinition = "TEXT")
    private String comment;

    /**
     * Indicates whether the reviewer actually purchased the product.
     * Used to improve review credibility.
     */
    @Column(nullable = false)
    @Builder.Default
    private boolean verifiedPurchase = false;

    /**
     * Indicates whether the review is approved by admin/moderator.
     * Only approved reviews are visible publicly.
     */
    @Column(nullable = false)
    @Builder.Default
    private boolean approved = false;
}