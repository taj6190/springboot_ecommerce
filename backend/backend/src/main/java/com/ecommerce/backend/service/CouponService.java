package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Coupon;
import com.ecommerce.backend.enums.CouponType;
import com.ecommerce.backend.exception.BadRequestException;
import com.ecommerce.backend.exception.DuplicateResourceException;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    @Transactional(readOnly = true)
    public Page<Coupon> getAllCoupons(Pageable pageable) {
        return couponRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Coupon getCouponById(UUID id) {
        return couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));
    }

    @Transactional
    public Coupon createCoupon(Coupon coupon) {
        if (couponRepository.existsByCode(coupon.getCode())) {
            throw new DuplicateResourceException("Coupon", "code", coupon.getCode());
        }
        coupon.setCode(coupon.getCode().toUpperCase());
        return couponRepository.save(coupon);
    }

    @Transactional
    public Coupon updateCoupon(UUID id, Coupon updated) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));

        coupon.setDescription(updated.getDescription());
        coupon.setType(updated.getType());
        coupon.setValue(updated.getValue());
        coupon.setMinOrderAmount(updated.getMinOrderAmount());
        coupon.setMaxDiscount(updated.getMaxDiscount());
        coupon.setUsageLimit(updated.getUsageLimit());
        coupon.setStartDate(updated.getStartDate());
        coupon.setEndDate(updated.getEndDate());
        coupon.setActive(updated.isActive());

        return couponRepository.save(coupon);
    }

    @Transactional
    public void deleteCoupon(UUID id) {
        if (!couponRepository.existsById(id)) {
            throw new ResourceNotFoundException("Coupon", "id", id);
        }
        couponRepository.deleteById(id);
    }

    @Transactional
    public void deleteCoupons(java.util.List<UUID> ids) {
        ids.forEach(this::deleteCoupon);
    }

    /**
     * Validate and apply a coupon, returning the discount amount.
     */
    @Transactional
    public BigDecimal applyCoupon(String code, BigDecimal orderTotal) {
        Coupon coupon = couponRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new BadRequestException("Invalid coupon code: " + code));

        if (!coupon.isActive()) {
            throw new BadRequestException("Coupon is not active");
        }

        Instant now = Instant.now();
        if (coupon.getStartDate() != null && now.isBefore(coupon.getStartDate())) {
            throw new BadRequestException("Coupon is not yet valid");
        }
        if (coupon.getEndDate() != null && now.isAfter(coupon.getEndDate())) {
            throw new BadRequestException("Coupon has expired");
        }

        if (coupon.getUsageLimit() > 0 && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new BadRequestException("Coupon usage limit reached");
        }

        if (coupon.getMinOrderAmount() != null && orderTotal.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new BadRequestException("Minimum order amount for this coupon is " + coupon.getMinOrderAmount());
        }

        BigDecimal discount;
        if (coupon.getType() == CouponType.PERCENTAGE) {
            discount = orderTotal.multiply(coupon.getValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (coupon.getMaxDiscount() != null && discount.compareTo(coupon.getMaxDiscount()) > 0) {
                discount = coupon.getMaxDiscount();
            }
        } else {
            discount = coupon.getValue();
        }

        // Don't let discount exceed order total
        if (discount.compareTo(orderTotal) > 0) {
            discount = orderTotal;
        }

        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);

        return discount;
    }
}
