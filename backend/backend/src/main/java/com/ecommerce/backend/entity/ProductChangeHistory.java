package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * ProductChangeHistory Entity
 *
 * Maintains an audit log of all changes made to products.
 *
 * This is useful for:
 * - Tracking product updates over time
 * - Debugging incorrect product data changes
 * - Admin and compliance auditing
 * - Change traceability in multi-user systems
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

    /**
     * Unique identifier for each change record.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * ID of the product that was modified.
     * Stored as UUID instead of relation to keep audit history stable
     * even if product entity structure changes later.
     */
    @Column(nullable = false)
    private UUID productId;

    /**
     * User or system component that performed the change.
     */
    @Column(nullable = false, length = 150)
    private String changedBy;

    /**
     * Type of change performed.
     * Example: CREATE, UPDATE, DELETE, PRICE_CHANGE, STOCK_UPDATE
     */
    @Column(nullable = false, length = 50)
    private String changeType;

    /**
     * Detailed description of what was changed.
     * Stored as TEXT to allow flexible structured or JSON-like logs.
     */
    @Column(columnDefinition = "TEXT")
    private String changeDetails;

    /**
     * Timestamp when the change occurred.
     */
    @Column(nullable = false)
    private Instant changedAt;
}