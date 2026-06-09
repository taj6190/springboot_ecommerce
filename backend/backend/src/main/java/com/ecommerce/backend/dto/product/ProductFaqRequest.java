package com.ecommerce.backend.dto.product;

import lombok.Data;

@Data
public class ProductFaqRequest {
    private String question;
    private String answer;
    private Integer displayOrder;
}
