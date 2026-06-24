package com.ecommerce.backend.dto.order;

import com.ecommerce.backend.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request DTO for updating the status of an existing order.
 * Used by admins to transition orders through the fulfillment pipeline.
 */
@Data
public class OrderStatusUpdateRequest {

    /** The new status to set on the order. Required. */
    @NotNull(message = "New status is required")
    private OrderStatus status;

    /** Optional notes explaining the reason for the status change. */
    private String notes;
}
