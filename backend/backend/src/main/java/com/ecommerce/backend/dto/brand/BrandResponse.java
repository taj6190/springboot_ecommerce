package com.ecommerce.backend.dto.brand;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrandResponse {
    private UUID id;
    private String nameEn;
    private String nameBn;
    private String slug;
    private String logoUrl;
    private String description;
    private boolean active;
}
