package com.ecommerce.backend.dto.product;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * StockUpdateRequest DTO
 *
 * Used for updating product or variant stock quantities.
 *
 * Supports different stock modification operations:
 * - ADD: Increase stock
 * - SUBTRACT: Decrease stock
 * - SET: Replace stock with a new value
 *
 * Typically used in:
 * - Inventory management
 * - Admin panel stock adjustments
 * - Order processing (stock deduction)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockUpdateRequest {

    /**
     * Quantity to apply based on operation type.
     */
    private Integer quantity;

    /**
     * Stock operation type:
     * ADD, SUBTRACT, or SET
     */
    private String operation; // ADD, SUBTRACT, SET
}