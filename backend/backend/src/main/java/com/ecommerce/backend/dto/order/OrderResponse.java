package com.ecommerce.backend.dto.order;

import com.ecommerce.backend.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Response DTO representing a complete order with all associated details.
 * Contains order items, shipping info, pricing, status history, and timestamps.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    /** The unique identifier of the order. */
    private UUID id;

    /** The human-readable order number (e.g., "ORD-20260101-XXXX"). */
    private String orderNumber;

    /** The ID of the user who placed the order. */
    private UUID userId;

    /** The full name of the user who placed the order. */
    private String userName;

    /** The subtotal before discounts and shipping. */
    private BigDecimal subtotal;

    /** The discount amount applied via coupon or promotion. */
    private BigDecimal discountAmount;

    /** The shipping cost for the order. */
    private BigDecimal shippingCost;

    /** The final total amount the customer pays (subtotal - discount + shipping). */
    private BigDecimal totalAmount;

    /** The current status of the order (e.g., PENDING, SHIPPED, DELIVERED). */
    private OrderStatus status;

    /** The recipient's name for shipping. */
    private String shippingName;

    /** The recipient's phone number for shipping. */
    private String shippingPhone;

    /** The shipping street address. */
    private String shippingAddress;

    /** The shipping city. */
    private String shippingCity;

    /** The shipping district or state. */
    private String shippingDistrict;

    /** The shipping postal/zip code. */
    private String shippingPostalCode;

    /** Any additional notes from the customer. */
    private String notes;

    /** The coupon code applied to the order, if any. */
    private String couponCode;

    /** The list of items included in this order. */
    private List<OrderItemResponse> items;

    /** The chronological history of status changes for this order. */
    private List<OrderStatusHistoryResponse> statusHistory;

    /** The timestamp when the order was created. */
    private Instant createdAt;

    /** The timestamp when the order was last updated. */
    private Instant updatedAt;

    /**
     * Inner DTO representing a single line item within an order response.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemResponse {

        /** The unique identifier of the order item. */
        private UUID id;

        /** The ID of the product in this line item. */
        private UUID productId;

        /** The ID of the product variant, if applicable. */
        private UUID variantId;

        /** The name of the product at the time of purchase. */
        private String productName;

        /** A description of the variant (e.g., "Red / XL"). */
        private String variantInfo;

        /** The SKU (Stock Keeping Unit) code of the item. */
        private String sku;

        /** The quantity of the product ordered. */
        private Integer quantity;

        /** The unit price of the product at the time of purchase. */
        private BigDecimal unitPrice;

        /** The total price for this line item (unitPrice × quantity). */
        private BigDecimal totalPrice;

        /** The URL of the product image for display. */
        private String imageUrl;
    }

    /**
     * Inner DTO representing a single entry in the order's status change history.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderStatusHistoryResponse {

        /** The previous order status before the change. */
        private OrderStatus fromStatus;

        /** The new order status after the change. */
        private OrderStatus toStatus;

        /** The name or identifier of who made the status change. */
        private String changedBy;

        /** The timestamp when the status change occurred. */
        private Instant changedAt;

        /** Any notes associated with the status change. */
        private String notes;
    }
}
