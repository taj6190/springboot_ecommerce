package com.ecommerce.backend.entity;

import com.ecommerce.backend.enums.PaymentMethod;
import com.ecommerce.backend.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Payment Entity
 *
 * Represents payment information associated with an order.
 * Tracks payment method, status, transaction details, and timestamps.
 *
 * Each order has exactly one payment record (One-to-One relationship).
 */
@Entity
@Table(name = "payments", indexes = {
        @Index(name = "idx_payment_order", columnList = "order_id"),
        @Index(name = "idx_payment_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment extends BaseEntity {

    /**
     * Associated order for this payment.
     * One-to-One relationship ensures each order has a single payment record.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    /**
     * Payment method used by the customer.
     * Example: CASH_ON_DELIVERY, CARD, MOBILE_BANKING, etc.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentMethod method;

    /**
     * Total amount paid for the order.
     */
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    /**
     * Current status of the payment.
     * Example: PENDING, COMPLETED, FAILED, REFUNDED.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    /**
     * External transaction ID from payment gateway (if applicable).
     */
    @Column(length = 100)
    private String transactionId;

    /**
     * Timestamp when payment was successfully completed.
     */
    private Instant paidAt;

    /**
     * Additional notes or metadata about the payment.
     */
    @Column(columnDefinition = "TEXT")
    private String notes;
}