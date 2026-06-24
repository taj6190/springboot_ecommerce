package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Wishlist Entity
 *
 * Represents products saved by users for future reference or purchase.
 *
 * This acts as a many-to-many bridge between User and Product,
 * with additional metadata like timestamp.
 */
@Entity
@Table(name = "wishlists", indexes = {
        @Index(name = "idx_wishlist_user", columnList = "user_id"),
        @Index(name = "idx_wishlist_product", columnList = "product_id")
},
        uniqueConstraints = @UniqueConstraint(
                name = "uk_wishlist_user_product",
                columnNames = {"user_id", "product_id"}
        ))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wishlist {

    /**
     * Unique identifier for wishlist entry.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * User who added the product to wishlist.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Product added to wishlist.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /**
     * Timestamp when product was added to wishlist.
     */
    @Column(nullable = false)
    @Builder.Default
    private Instant addedAt = Instant.now();
}