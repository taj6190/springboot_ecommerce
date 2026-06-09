package com.ecommerce.backend.entity;

import com.ecommerce.backend.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Tracks order status transitions for audit.
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

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus toStatus;

    @Column(nullable = false, length = 150)
    private String changedBy;

    @Column(nullable = false)
    private Instant changedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
