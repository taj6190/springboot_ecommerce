package com.ecommerce.backend.dto.order;

import com.ecommerce.backend.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderStatusUpdateRequest {
    @NotNull(message = "New status is required")
    private OrderStatus status;
    private String notes;
}
