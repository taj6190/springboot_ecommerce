package com.ecommerce.backend.entity;

import com.ecommerce.backend.enums.CouponType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Coupon/promotion entity for discount management.
 */
@Entity
@Table(name = "coupons", indexes = {
        @Index(name = "idx_coupon_code", columnList = "code", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon extends BaseEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CouponType type;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal value;

    @Column(precision = 12, scale = 2)
    private BigDecimal minOrderAmount;

    @Column(precision = 12, scale = 2)
    private BigDecimal maxDiscount;

    @Column(nullable = false)
    @Builder.Default
    private Integer usageLimit = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer usedCount = 0;

    private Instant startDate;
    private Instant endDate;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
