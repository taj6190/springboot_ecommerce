package com.ecommerce.backend.dto.product;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockUpdateRequest {
    private Integer quantity;
    private String operation; // ADD, SUBTRACT, SET
}
