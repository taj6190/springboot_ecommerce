package com.ecommerce.backend.dto.order;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

/**
 * Request DTO for placing a new order.
 * Contains order items, shipping details, and optional coupon information.
 */
@Data
public class OrderRequest {

    /** The list of items to include in the order. Must contain at least one item. */
    @NotEmpty(message = "Order must have at least one item")
    private List<OrderItemRequest> items;

    /** The recipient's name for shipping. Required. */
    @NotBlank(message = "Shipping name is required")
    private String shippingName;

    /** The guest user's email for order tracking (used when not logged in). Optional. */
    private String guestEmail;

    /** The recipient's phone number for shipping. Required. */
    @NotBlank(message = "Shipping phone is required")
    private String shippingPhone;

    /** The full shipping street address. Required. */
    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    /** The shipping city. Optional. */
    private String shippingCity;

    /** The shipping district or state. Optional. */
    private String shippingDistrict;

    /** The shipping postal/zip code. Optional. */
    private String shippingPostalCode;

    /** Any additional notes from the customer about the order. Optional. */
    private String notes;

    /** A coupon code to apply for a discount on the order. Optional. */
    private String couponCode;

    /**
     * Inner DTO representing a single item within an order request.
     */
    @Data
    public static class OrderItemRequest {

        /** The ID of the product being ordered. Required. */
        @NotNull(message = "Product ID is required")
        private UUID productId;

        /** The ID of the specific product variant (e.g., size/color). Optional. */
        private UUID variantId;

        /** The quantity of the product to order. Required, minimum 1. */
        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
    }
}
