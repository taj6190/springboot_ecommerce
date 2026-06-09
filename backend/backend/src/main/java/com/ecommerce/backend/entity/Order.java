package com.ecommerce.backend.entity;

import com.ecommerce.backend.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Order entity with status tracking and concurrency-safe stock handling.
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

    @Column(nullable = false, unique = true, length = 30)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal subtotal;

    @Column(precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal shippingCost = BigDecimal.ZERO;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    // --- Shipping Address ---
    @Column(nullable = false, length = 100)
    private String shippingName;

    @Column(nullable = false, length = 20)
    private String shippingPhone;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String shippingAddress;

    @Column(length = 100)
    private String shippingCity;

    @Column(length = 100)
    private String shippingDistrict;

    @Column(length = 10)
    private String shippingPostalCode;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(length = 50)
    private String couponCode;

    // --- Items ---
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    // --- Status History ---
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("changedAt DESC")
    @Builder.Default
    private List<OrderStatusHistory> statusHistory = new ArrayList<>();

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }
}
