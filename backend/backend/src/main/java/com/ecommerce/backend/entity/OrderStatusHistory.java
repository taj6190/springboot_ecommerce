package com.ecommerce.backend.entity;

import com.ecommerce.backend.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * OrderStatusHistory Entity
 *
 * Maintains an audit trail of all status changes for an order.
 *
 * This is useful for:
 * - Tracking order lifecycle transitions
 * - Debugging order flow issues
 * - Customer support and transparency
 */
@Entity
@Table(name = "order_status_history", indexes = {
        @Index(name = "idx_status_history_order", columnList = "order_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderStatusHistory {

    /**
     * Unique identifier for each status change record.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * Order associated with this status change event.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    /**
     * Previous status before the change.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus fromStatus;

    /**
     * New status after the change.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus toStatus;

    /**
     * User or system component that performed the status change.
     */
    @Column(nullable = false, length = 150)
    private String changedBy;

    /**
     * Timestamp when the status change occurred.
     */
    @Column(nullable = false)
    private Instant changedAt;

    /**
     * Optional notes explaining the reason for the status change.
     */
    @Column(columnDefinition = "TEXT")
    private String notes;
}