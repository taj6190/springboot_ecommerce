package com.ecommerce.backend.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductFaqResponse {
    private UUID id;
    private String question;
    private String answer;
    private Integer displayOrder;
}
