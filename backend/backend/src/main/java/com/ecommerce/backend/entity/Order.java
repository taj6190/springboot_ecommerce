package com.ecommerce.backend.entity;

import com.ecommerce.backend.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Order Entity
 *
 * Represents a customer order in the system.
 * Handles order lifecycle, pricing breakdown, shipping details,
 * and related entities like items and status history.
 *
 * Designed for concurrency-safe and scalable e-commerce operations.
 */
@Entity
@Table(name = "orders", indexes = {
        @Index(name = "idx_order_number", columnList = "orderNumber", unique = true),
        @Index(name = "idx_order_user", columnList = "user_id"),
        @Index(name = "idx_order_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order extends BaseEntity {

    /**
     * Unique human-readable order identifier (e.g. ORD-2026-0001).
     */
    @Column(nullable = false, unique = true, length = 30)
    private String orderNumber;

    /**
     * User who placed the order.
     * Nullable to support guest checkout if required.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    /**
     * Total cost of items before discounts and shipping.
     */
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal subtotal;

    /**
     * Discount applied to the order (from coupons or promotions).
     */
    @Column(precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    /**
     * Shipping cost applied to the order.
     */
    @Column(precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal shippingCost = BigDecimal.ZERO;

    /**
     * Final payable amount after applying discounts and shipping.
     */
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal totalAmount;

    /**
     * Current status of the order lifecycle.
     * Example: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    // --- Shipping Address ---

    /**
     * Name of the recipient for delivery.
     */
    @Column(nullable = false, length = 100)
    private String shippingName;

    /**
     * Contact phone number for delivery communication.
     */
    @Column(nullable = false, length = 20)
    private String shippingPhone;

    /**
     * Full shipping address (detailed text format).
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String shippingAddress;

    /**
     * City for shipping destination.
     */
    @Column(length = 100)
    private String shippingCity;

    /**
     * District for shipping destination.
     */
    @Column(length = 100)
    private String shippingDistrict;

    /**
     * Postal/ZIP code for shipping destination.
     */
    @Column(length = 10)
    private String shippingPostalCode;

    /**
     * Optional customer notes for the order.
     */
    @Column(columnDefinition = "TEXT")
    private String notes;

    /**
     * Applied coupon code (if any).
     */
    @Column(length = 50)
    private String couponCode;

    // --- Order Items ---

    /**
     * List of items included in this order.
     * Cascade ensures items are persisted/removed with the order.
     */
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    // --- Order Status History ---

    /**
     * Historical tracking of order status changes.
     * Useful for audit and order lifecycle tracking.
     */
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("changedAt DESC")
    @Builder.Default
    private List<OrderStatusHistory> statusHistory = new ArrayList<>();

    /**
     * Helper method to safely add an item to the order.
     * Also maintains bidirectional relationship consistency.
     */
    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }
}