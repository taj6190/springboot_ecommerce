package com.ecommerce.backend.entity;

import jakarta.persistence.Embeddable;
import lombok.*;

/**
 * ProductSpecification Embeddable
 *
 * Represents a key-value pair used to store additional product attributes.
 *
 * Examples:
 * - "Color" -> "Red"
 * - "Weight" -> "1.5kg"
 * - "Material" -> "Aluminum"
 *
 * Stored as part of Product entity using @ElementCollection.
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductSpecification {

    /**
     * Specification key (attribute name).
     */
    private String key;

    /**
     * Specification value corresponding to the key.
     */
    private String value;
}