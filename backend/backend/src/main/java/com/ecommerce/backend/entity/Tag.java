package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Tag entity for product tagging.
 */
@Entity
@Table(name = "tags", indexes = {
        @Index(name = "idx_tag_name", columnList = "name", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 120)
    private String slug;
}
