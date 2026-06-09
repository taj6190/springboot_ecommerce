package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Wishlist entity for customer favorites.
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

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    @Builder.Default
    private Instant addedAt = Instant.now();
}
