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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private UUID id;
    private String orderNumber;
    private UUID userId;
    private String userName;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal shippingCost;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private String shippingName;
    private String shippingPhone;
    private String shippingAddress;
    private String shippingCity;
    private String shippingDistrict;
    private String shippingPostalCode;
    private String notes;
    private String couponCode;
    private List<OrderItemResponse> items;
    private List<OrderStatusHistoryResponse> statusHistory;
    private Instant createdAt;
    private Instant updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemResponse {
        private UUID id;
        private UUID productId;
        private UUID variantId;
        private String productName;
        private String variantInfo;
        private String sku;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
        private String imageUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderStatusHistoryResponse {
        private OrderStatus fromStatus;
        private OrderStatus toStatus;
        private String changedBy;
        private Instant changedAt;
        private String notes;
    }
}
