package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.ApiResponse;
import com.ecommerce.backend.dto.brand.BrandRequest;
import com.ecommerce.backend.dto.brand.BrandResponse;
import com.ecommerce.backend.service.BrandService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Brand Controller
 *
 * Exposes endpoints for managing product brands.
 * Handles both public endpoints for retrieving active brands and admin/manager restricted endpoints for CRUD operations.
 */
@RestController
@RequiredArgsConstructor
@Tag(name = "Brands", description = "Brand management")
public class BrandController {

    /**
     * Service handling the business logic for brands.
     */
    private final BrandService brandService;

    /**
     * Retrieves all active brands in the system.
     * This endpoint is public and is used to list brands on client-facing portals.
     *
     * @return a ResponseEntity containing a list of active brands
     */
    @GetMapping("/public/brands")
    @Operation(summary = "Get all active brands (public)")
    public ResponseEntity<ApiResponse<List<BrandResponse>>> getActiveBrands() {
        return ResponseEntity.ok(ApiResponse.success(brandService.getAllActiveBrands()));
    }

    /**
     * Retrieves details of a specific brand by its SEO slug.
     * This endpoint is public and supports catalog search/filter operations.
     *
     * @param slug the unique SEO-friendly identifier of the brand
     * @return a ResponseEntity containing the brand details
     */
    @GetMapping("/public/brands/{slug}")
    @Operation(summary = "Get brand by slug (public)")
    public ResponseEntity<ApiResponse<BrandResponse>> getBrandBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(brandService.getBrandBySlug(slug)));
    }

    /**
     * Retrieves all brands with pagination support.
     * Restricted to admin or product manager users.
     *
     * @param pageable pagination parameters (page number, size, sort, etc.)
     * @return a ResponseEntity containing a pageable list of brands
     */
    @GetMapping("/admin/brands")
    @PreAuthorize("hasAnyRole('ADMIN','PRODUCT_MANAGER')")
    @Operation(summary = "Get all brands paginated (admin)")
    public ResponseEntity<ApiResponse<Page<BrandResponse>>> getAllBrands(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(brandService.getAllBrands(pageable)));
    }

    /**
     * Retrieves brand details by its UUID.
     * Restricted to admin or product manager users.
     *
     * @param id the unique UUID of the brand
     * @return a ResponseEntity containing the brand details
     */
    @GetMapping("/admin/brands/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PRODUCT_MANAGER')")
    public ResponseEntity<ApiResponse<BrandResponse>> getBrandById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(brandService.getBrandById(id)));
    }

    /**
     * Creates a new brand in the system.
     * Restricted to admin or product manager users.
     *
     * @param request the request body containing brand data (names, slug, logo, description, etc.)
     * @return a ResponseEntity containing the created brand details
     */
    @PostMapping("/admin/brands")
    @PreAuthorize("hasAnyRole('ADMIN','PRODUCT_MANAGER')")
    @Operation(summary = "Create brand")
    public ResponseEntity<ApiResponse<BrandResponse>> createBrand(@Valid @RequestBody BrandRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Brand created", brandService.createBrand(request)));
    }

    /**
     * Updates an existing brand configuration.
     * Restricted to admin or product manager users.
     *
     * @param id the unique UUID of the brand to update
     * @param request the updated brand details
     * @return a ResponseEntity containing the updated brand details
     */
    @PutMapping("/admin/brands/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PRODUCT_MANAGER')")
    @Operation(summary = "Update brand")
    public ResponseEntity<ApiResponse<BrandResponse>> updateBrand(@PathVariable UUID id, @Valid @RequestBody BrandRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Brand updated", brandService.updateBrand(id, request)));
    }

    /**
     * Deletes a brand from the system by its UUID.
     * Restricted strictly to users with the ADMIN role.
     *
     * @param id the unique UUID of the brand to delete
     * @return a ResponseEntity indicating successful deletion
     */
    @DeleteMapping("/admin/brands/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete brand")
    public ResponseEntity<ApiResponse<Void>> deleteBrand(@PathVariable UUID id) {
        brandService.deleteBrand(id);
        return ResponseEntity.ok(ApiResponse.success("Brand deleted"));
    }

    /**
     * Deletes multiple brands in a bulk action.
     * Restricted strictly to users with the ADMIN role.
     *
     * @param ids list of unique UUIDs of the brands to delete
     * @return a ResponseEntity indicating successful deletion
     */
    @DeleteMapping("/admin/brands/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bulk delete brands")
    public ResponseEntity<ApiResponse<Void>> deleteBrands(@RequestBody List<UUID> ids) {
        brandService.deleteBrands(ids);
        return ResponseEntity.ok(ApiResponse.success("Brands deleted successfully"));
    }
}
