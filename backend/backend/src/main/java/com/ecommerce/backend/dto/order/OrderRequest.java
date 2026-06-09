package com.ecommerce.backend.dto.order;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class OrderRequest {

    @NotEmpty(message = "Order must have at least one item")
    private List<OrderItemRequest> items;

    @NotBlank(message = "Shipping name is required")
    private String shippingName;

    private String guestEmail;

    @NotBlank(message = "Shipping phone is required")
    private String shippingPhone;

    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    private String shippingCity;
    private String shippingDistrict;
    private String shippingPostalCode;
    private String notes;
    private String couponCode;

    @Data
    public static class OrderItemRequest {
        @NotNull(message = "Product ID is required")
        private UUID productId;

        private UUID variantId;

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
    }
}
