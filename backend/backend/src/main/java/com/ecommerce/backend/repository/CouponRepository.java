package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Coupon Repository
 *
 * Provides database access operations for the Coupon entity.
 */
@Repository
public interface CouponRepository extends JpaRepository<Coupon, UUID> {

    /**
     * Finds a coupon by its unique promo code.
     *
     * @param code the coupon code
     * @return an Optional containing the coupon if found
     */
    Optional<Coupon> findByCode(String code);

    /**
     * Checks if a coupon code is already registered in the system.
     *
     * @param code the coupon code
     * @return true if it exists, false otherwise
     */
    boolean existsByCode(String code);
}
