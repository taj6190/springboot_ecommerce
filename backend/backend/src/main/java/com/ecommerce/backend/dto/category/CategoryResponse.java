package com.ecommerce.backend.dto.category;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    private UUID id;
    private String nameEn;
    private String nameBn;
    private String slug;
    private String descriptionEn;
    private String descriptionBn;
    private String imageUrl;
    private UUID parentId;
    private String parentName;
    private Integer displayOrder;
    private boolean active;
    private Integer level;
    private List<CategoryResponse> children;
}
