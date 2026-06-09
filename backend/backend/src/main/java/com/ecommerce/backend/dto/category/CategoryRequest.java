package com.ecommerce.backend.dto.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class CategoryRequest {

    @NotBlank(message = "English name is required")
    @Size(max = 200)
    private String nameEn;

    @Size(max = 200)
    private String nameBn;

    private String descriptionEn;
    private String descriptionBn;
    private String imageUrl;
    private UUID parentId;
    private Integer displayOrder;
    private Boolean active;
}
