package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Tracks all changes to products for audit purposes.
 */
@Entity
@Table(name = "product_change_history", indexes = {
        @Index(name = "idx_change_product", columnList = "product_id"),
        @Index(name = "idx_change_timestamp", columnList = "changedAt")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductChangeHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID productId;

    @Column(nullable = false, length = 150)
    private String changedBy;

    @Column(nullable = false, length = 50)
    private String changeType;

    @Column(columnDefinition = "TEXT")
    private String changeDetails;

    @Column(nullable = false)
    private Instant changedAt;
}
