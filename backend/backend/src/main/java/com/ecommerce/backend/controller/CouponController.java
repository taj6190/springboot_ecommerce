package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.ApiResponse;
import com.ecommerce.backend.entity.Coupon;
import com.ecommerce.backend.service.CouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

/**
 * Coupon Controller
 *
 * Exposes endpoints for managing discount coupons and promotional offers.
 * Includes admin endpoints for CRUD operations and a public/customer endpoint for coupon validation.
 */
@RestController
@RequiredArgsConstructor
@Tag(name = "Coupons", description = "Coupon management")
public class CouponController {

    /**
     * Service handling the business logic for coupon creation and validation.
     */
    private final CouponService couponService;

    /**
     * Retrieves all coupons with pagination support.
     * Restricted to admin or product manager users.
     *
     * @param pageable pagination parameters (page, size, sort, etc.)
     * @return a ResponseEntity containing a pageable list of coupons
     */
    @GetMapping("/admin/coupons")
    @PreAuthorize("hasAnyRole('ADMIN','PRODUCT_MANAGER')")
    @Operation(summary = "Get all coupons")
    public ResponseEntity<ApiResponse<Page<Coupon>>> getAll(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(couponService.getAllCoupons(pageable)));
    }

    /**
     * Retrieves details of a coupon by its UUID.
     * Restricted to admin or product manager users.
     *
     * @param id the unique UUID of the coupon
     * @return a ResponseEntity containing the coupon details
     */
    @GetMapping("/admin/coupons/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PRODUCT_MANAGER')")
    public ResponseEntity<ApiResponse<Coupon>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(couponService.getCouponById(id)));
    }

    /**
     * Creates a new discount coupon.
     * Restricted to admin or product manager users.
     *
     * @param coupon the coupon configuration to create (code, discount details, limits, expiry)
     * @return a ResponseEntity containing the created coupon details
     */
    @PostMapping("/admin/coupons")
    @PreAuthorize("hasAnyRole('ADMIN','PRODUCT_MANAGER')")
    @Operation(summary = "Create coupon")
    public ResponseEntity<ApiResponse<Coupon>> create(@RequestBody Coupon coupon) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Coupon created", couponService.createCoupon(coupon)));
    }

    /**
     * Updates an existing coupon configuration.
     * Restricted to admin or product manager users.
     *
     * @param id the unique UUID of the coupon to update
     * @param coupon the updated coupon details
     * @return a ResponseEntity containing the updated coupon details
     */
    @PutMapping("/admin/coupons/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PRODUCT_MANAGER')")
    @Operation(summary = "Update coupon")
    public ResponseEntity<ApiResponse<Coupon>> update(@PathVariable UUID id, @RequestBody Coupon coupon) {
        return ResponseEntity.ok(ApiResponse.success("Coupon updated", couponService.updateCoupon(id, coupon)));
    }

    /**
     * Deletes a coupon from the system by its UUID.
     * Restricted strictly to users with the ADMIN role.
     *
     * @param id the unique UUID of the coupon to delete
     * @return a ResponseEntity indicating successful deletion
     */
    @DeleteMapping("/admin/coupons/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete coupon")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.success("Coupon deleted"));
    }

    /**
     * Deletes multiple coupons in a bulk action.
     * Restricted strictly to users with the ADMIN role.
     *
     * @param ids list of unique UUIDs of the coupons to delete
     * @return a ResponseEntity indicating successful deletion
     */
    @DeleteMapping("/admin/coupons/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bulk delete coupons")
    public ResponseEntity<ApiResponse<Void>> deleteBulk(@RequestBody java.util.List<UUID> ids) {
        couponService.deleteCoupons(ids);
        return ResponseEntity.ok(ApiResponse.success("Coupons deleted successfully"));
    }

    /**
     * Validates a coupon code against order total rules and checks active dates.
     * Calculates the discounted amount.
     * This endpoint is public for users applying coupons during checkout.
     *
     * @param body request payload containing 'code' and optionally 'orderTotal'
     * @return a ResponseEntity with the calculated discount details
     */
    @PostMapping("/coupons/validate")
    @Operation(summary = "Validate a coupon code")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validate(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        BigDecimal orderTotal = new BigDecimal(body.getOrDefault("orderTotal", "0"));
        BigDecimal discount = couponService.applyCoupon(code, orderTotal);
        return ResponseEntity.ok(ApiResponse.success(Map.of("discount", discount, "code", code)));
    }
}
