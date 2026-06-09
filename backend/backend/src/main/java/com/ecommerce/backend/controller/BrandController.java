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

@RestController
@RequiredArgsConstructor
@Tag(name = "Brands", description = "Brand management")
public class BrandController {

    private final BrandService brandService;

    @GetMapping("/public/brands")
    @Operation(summary = "Get all active brands (public)")
    public ResponseEntity<ApiResponse<List<BrandResponse>>> getActiveBrands() {
        return ResponseEntity.ok(ApiResponse.success(brandService.getAllActiveBrands()));
    }

    @GetMapping("/public/brands/{slug}")
    @Operation(summary = "Get brand by slug (public)")
    public ResponseEntity<ApiResponse<BrandResponse>> getBrandBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(brandService.getBrandBySlug(slug)));
    }

    @GetMapping("/admin/brands")
    @PreAuthorize("hasAnyRole('ADMIN','PRODUCT_MANAGER')")
    @Operation(summary = "Get all brands paginated (admin)")
    public ResponseEntity<ApiResponse<Page<BrandResponse>>> getAllBrands(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(brandService.getAllBrands(pageable)));
    }

    @GetMapping("/admin/brands/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PRODUCT_MANAGER')")
    public ResponseEntity<ApiResponse<BrandResponse>> getBrandById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(brandService.getBrandById(id)));
    }

    @PostMapping("/admin/brands")
    @PreAuthorize("hasAnyRole('ADMIN','PRODUCT_MANAGER')")
    @Operation(summary = "Create brand")
    public ResponseEntity<ApiResponse<BrandResponse>> createBrand(@Valid @RequestBody BrandRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Brand created", brandService.createBrand(request)));
    }

    @PutMapping("/admin/brands/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PRODUCT_MANAGER')")
    @Operation(summary = "Update brand")
    public ResponseEntity<ApiResponse<BrandResponse>> updateBrand(@PathVariable UUID id, @Valid @RequestBody BrandRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Brand updated", brandService.updateBrand(id, request)));
    }

    @DeleteMapping("/admin/brands/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete brand")
    public ResponseEntity<ApiResponse<Void>> deleteBrand(@PathVariable UUID id) {
        brandService.deleteBrand(id);
        return ResponseEntity.ok(ApiResponse.success("Brand deleted"));
    }

    @DeleteMapping("/admin/brands/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bulk delete brands")
    public ResponseEntity<ApiResponse<Void>> deleteBrands(@RequestBody List<UUID> ids) {
        brandService.deleteBrands(ids);
        return ResponseEntity.ok(ApiResponse.success("Brands deleted successfully"));
    }
}
