package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Homepage slider/banner management.
 */
@Entity
@Table(name = "sliders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Slider extends BaseEntity {

    @Column(length = 200)
    private String titleEn;

    @Column(length = 200)
    private String titleBn;

    @Column(length = 300)
    private String subtitleEn;

    @Column(length = 300)
    private String subtitleBn;

    @Column(nullable = false)
    private String imageUrl;

    @Column(length = 500)
    private String linkUrl;

    @Column(nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    private Instant startDate;
    private Instant endDate;
}
