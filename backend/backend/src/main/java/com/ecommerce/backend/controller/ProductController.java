package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.ApiResponse;
import com.ecommerce.backend.dto.product.ProductRequest;
import com.ecommerce.backend.dto.product.StockUpdateRequest;
import com.ecommerce.backend.dto.product.ProductResponse;
import com.ecommerce.backend.enums.ProductStatus;
import com.ecommerce.backend.service.ProductService;
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
@Tag(name = "Products", description = "Product management")
public class ProductController {

    private final ProductService productService;

    // --- Public endpoints ---

    @GetMapping("/public/products")
    @Operation(summary = "Get published products with filters (public)")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getPublishedProducts(
            @RequestParam(required = false) List<UUID> categoryIds,
            @RequestParam(required = false) List<UUID> brandIds,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(productService.getPublishedProducts(categoryIds, brandIds, minPrice, maxPrice, keyword, pageable)));
    }

    @GetMapping("/public/products/{slug}")
    @Operation(summary = "Get product by slug (public)")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductBySlug(slug)));
    }

    @GetMapping("/public/products/search")
    @Operation(summary = "Search products")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> searchProducts(
            @RequestParam String keyword, @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(productService.searchProducts(keyword, pageable)));
    }

    @GetMapping("/public/products/category/{categoryId}")
    @Operation(summary = "Get products by category")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getByCategory(
            @PathVariable UUID categoryId, @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductsByCategory(categoryId, pageable)));
    }

    @GetMapping("/public/products/brand/{brandId}")
    @Operation(summary = "Get products by brand")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getByBrand(
            @PathVariable UUID brandId, @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductsByBrand(brandId, pageable)));
    }

    @GetMapping("/public/products/featured")
    @Operation(summary = "Get featured products")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getFeatured() {
        return ResponseEntity.ok(ApiResponse.success(productService.getFeaturedProducts()));
    }

    @GetMapping("/public/products/trending")
    @Operation(summary = "Get trending products")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getTrending() {
        return ResponseEntity.ok(ApiResponse.success(productService.getTrendingProducts()));
    }

    @GetMapping("/public/products/flash-sale")
    @Operation(summary = "Get flash sale products")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getFlashSale() {
        return ResponseEntity.ok(ApiResponse.success(productService.getFlashSaleProducts()));
    }

    // --- Admin endpoints ---

    @GetMapping("/admin/products")
    @PreAuthorize("hasAnyRole('ADMIN','PRODUCT_MANAGER','INVENTORY_MANAGER')")
    @Operation(summary = "Get all products (admin)")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getAllProducts(
            @RequestParam(required = false) ProductStatus status,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(productService.getAllProducts(status, keyword, pageable)));
    }

    @GetMapping("/admin/products/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PRODUCT_MANAGER','INVENTORY_MANAGER')")
    @Operation(summary = "Get product by ID (admin)")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductById(id)));
    }

    @PostMapping("/admin/products")
    @PreAuthorize("hasAnyRole('ADMIN','PRODUCT_MANAGER')")
    @Operation(summary = "Create product")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(@Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Product created", response));
    }

    @PutMapping("/admin/products/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PRODUCT_MANAGER')")
    @Operation(summary = "Update product")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable UUID id, @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Product updated", productService.updateProduct(id, request)));
    }

    @DeleteMapping("/admin/products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete product")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable UUID id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted"));
    }

    @DeleteMapping("/admin/products/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bulk delete products")
    public ResponseEntity<ApiResponse<Void>> deleteProducts(@RequestBody List<UUID> ids) {
        productService.deleteProducts(ids);
        return ResponseEntity.ok(ApiResponse.success("Products deleted successfully"));
    }

    @GetMapping("/admin/products/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER')")
    @Operation(summary = "Get low stock products")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getLowStock() {
        return ResponseEntity.ok(ApiResponse.success(productService.getLowStockProducts()));
    }

    @PatchMapping("/admin/products/{id}/stock")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER')")
    @Operation(summary = "Quick update stock")
    public ResponseEntity<ApiResponse<ProductResponse>> updateStock(
            @PathVariable UUID id, @RequestBody StockUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Stock updated", 
                productService.updateStock(id, request.getQuantity(), request.getOperation())));
    }
}
