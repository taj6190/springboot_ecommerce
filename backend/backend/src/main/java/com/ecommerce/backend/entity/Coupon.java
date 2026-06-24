package com.ecommerce.backend.entity;

import com.ecommerce.backend.enums.CouponType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Coupon Entity
 *
 * Represents promotional discount coupons used in the system.
 * Supports different discount strategies such as percentage or fixed amount.
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

    /**
     * Unique coupon code used by customers (e.g. SAVE10, FEST2026).
     */
    @Column(nullable = false, unique = true, length = 50)
    private String code;

    /**
     * Optional description explaining the coupon rules or purpose.
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Type of discount:
     * Example: PERCENTAGE or FIXED_AMOUNT.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CouponType type;

    /**
     * Discount value.
     * - If PERCENTAGE → represents % (e.g. 10 = 10%)
     * - If FIXED_AMOUNT → represents fixed discount value
     */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal value;

    /**
     * Minimum order amount required to apply this coupon.
     * Null means no minimum restriction.
     */
    @Column(precision = 12, scale = 2)
    private BigDecimal minOrderAmount;

    /**
     * Maximum discount allowed for this coupon.
     * Useful for percentage-based coupons.
     */
    @Column(precision = 12, scale = 2)
    private BigDecimal maxDiscount;

    /**
     * Maximum number of times this coupon can be used.
     * 0 means unlimited usage (based on business logic).
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer usageLimit = 0;

    /**
     * Number of times this coupon has already been used.
     * Incremented after successful application.
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer usedCount = 0;

    /**
     * Coupon validity start date/time.
     * Before this, coupon cannot be used.
     */
    private Instant startDate;

    /**
     * Coupon expiry date/time.
     * After this, coupon becomes invalid.
     */
    private Instant endDate;

    /**
     * Indicates whether the coupon is active or disabled.
     * Inactive coupons cannot be applied.
     */
    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}