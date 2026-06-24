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

/**
 * Coupon Service
 *
 * Handles the business logic for discount coupons.
 * Manages creation, lifecycle, pagination retrieval, bulk deletions, and checkout rules validation.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CouponService {

    /**
     * Repository interface for checking, saving, and updating Coupon records in the database.
     */
    private final CouponRepository couponRepository;

    /**
     * Retrieves all coupons with pagination.
     *
     * @param pageable pagination parameters
     * @return page of Coupon records
     */
    @Transactional(readOnly = true)
    public Page<Coupon> getAllCoupons(Pageable pageable) {
        return couponRepository.findAll(pageable);
    }

    /**
     * Retrieves details of a specific coupon by its UUID.
     *
     * @param id unique UUID of the coupon
     * @return the Coupon entity details
     * @throws ResourceNotFoundException if the coupon is not found
     */
    @Transactional(readOnly = true)
    public Coupon getCouponById(UUID id) {
        return couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));
    }

    /**
     * Creates a new coupon, converting the code format to upper case.
     *
     * @param coupon the coupon configuration to create
     * @return created Coupon details
     * @throws DuplicateResourceException if a coupon with the same code already exists
     */
    @Transactional
    public Coupon createCoupon(Coupon coupon) {
        if (couponRepository.existsByCode(coupon.getCode())) {
            throw new DuplicateResourceException("Coupon", "code", coupon.getCode());
        }
        coupon.setCode(coupon.getCode().toUpperCase());
        return couponRepository.save(coupon);
    }

    /**
     * Updates an existing coupon configuration.
     *
     * @param id unique UUID of the coupon to update
     * @param updated updated coupon configurations
     * @return updated Coupon details
     * @throws ResourceNotFoundException if the coupon does not exist
     */
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

    /**
     * Deletes a coupon from the database.
     *
     * @param id unique UUID of the coupon to delete
     * @throws ResourceNotFoundException if the coupon does not exist
     */
    @Transactional
    public void deleteCoupon(UUID id) {
        if (!couponRepository.existsById(id)) {
            throw new ResourceNotFoundException("Coupon", "id", id);
        }
        couponRepository.deleteById(id);
    }

    /**
     * Bulk deletes multiple coupons by their UUIDs.
     *
     * @param ids list of coupon UUIDs to delete
     */
    @Transactional
    public void deleteCoupons(java.util.List<UUID> ids) {
        ids.forEach(this::deleteCoupon);
    }

    /**
     * Validates and applies a coupon code against order rules.
     * Evaluates constraints (active dates, min order value, usage limits) and calculates the discount amount.
     * Increments the coupon's usage count on success.
     *
     * @param code coupon code string (case-insensitive)
     * @param orderTotal target order total value to validate against minimum amounts
     * @return the calculated discount amount
     * @throws BadRequestException if coupon is invalid, inactive, expired, limit reached, or below minimum order value
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
