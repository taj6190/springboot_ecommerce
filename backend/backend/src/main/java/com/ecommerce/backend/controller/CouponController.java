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

@RestController
@RequiredArgsConstructor
@Tag(name = "Coupons", description = "Coupon management")
public class CouponController {

    private final CouponService couponService;

    @GetMapping("/admin/coupons")
    @PreAuthorize("hasAnyRole('ADMIN','PRODUCT_MANAGER')")
    @Operation(summary = "Get all coupons")
    public ResponseEntity<ApiResponse<Page<Coupon>>> getAll(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(couponService.getAllCoupons(pageable)));
    }

    @GetMapping("/admin/coupons/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PRODUCT_MANAGER')")
    public ResponseEntity<ApiResponse<Coupon>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(couponService.getCouponById(id)));
    }

    @PostMapping("/admin/coupons")
    @PreAuthorize("hasAnyRole('ADMIN','PRODUCT_MANAGER')")
    @Operation(summary = "Create coupon")
    public ResponseEntity<ApiResponse<Coupon>> create(@RequestBody Coupon coupon) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Coupon created", couponService.createCoupon(coupon)));
    }

    @PutMapping("/admin/coupons/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PRODUCT_MANAGER')")
    @Operation(summary = "Update coupon")
    public ResponseEntity<ApiResponse<Coupon>> update(@PathVariable UUID id, @RequestBody Coupon coupon) {
        return ResponseEntity.ok(ApiResponse.success("Coupon updated", couponService.updateCoupon(id, coupon)));
    }

    @DeleteMapping("/admin/coupons/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete coupon")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.success("Coupon deleted"));
    }

    @DeleteMapping("/admin/coupons/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bulk delete coupons")
    public ResponseEntity<ApiResponse<Void>> deleteBulk(@RequestBody java.util.List<UUID> ids) {
        couponService.deleteCoupons(ids);
        return ResponseEntity.ok(ApiResponse.success("Coupons deleted successfully"));
    }

    @PostMapping("/coupons/validate")
    @Operation(summary = "Validate a coupon code")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validate(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        BigDecimal orderTotal = new BigDecimal(body.getOrDefault("orderTotal", "0"));
        BigDecimal discount = couponService.applyCoupon(code, orderTotal);
        return ResponseEntity.ok(ApiResponse.success(Map.of("discount", discount, "code", code)));
    }
}
