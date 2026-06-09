package com.ecommerce.backend.enums;

/**
 * Order status flow:
 * PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
 *                                             → CANCELLED
 *                                             → RETURNED
 */
public enum OrderStatus {
    PENDING,
    CONFIRMED,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    CANCELLED,
    RETURNED
}
