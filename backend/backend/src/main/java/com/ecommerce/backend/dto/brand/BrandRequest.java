package com.ecommerce.backend.dto.brand;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BrandRequest {

    @NotBlank(message = "English name is required")
    @Size(max = 200)
    private String nameEn;

    @Size(max = 200)
    private String nameBn;

    private String logoUrl;
    private String description;
    private Boolean active;
}
