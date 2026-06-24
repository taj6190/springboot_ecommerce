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

/**
 * Product Controller
 *
 * Exposes endpoints for managing products and their inventory.
 * Supports rich catalog search and filtering, along with detailed admin operations for product setup and stock replenishment.
 */
@RestController
@RequiredArgsConstructor
@Tag(name = "Products", description = "Product management")
public class ProductController {

    /**
     * Service handling the business logic for product lifecycle and queries.
     */
    private final ProductService productService;

    // --- Public endpoints ---

    /**
     * Retrieves published (active) products matching optional filters with pagination support.
     * This endpoint is public and serves the primary storefront catalog listing.
     *
     * @param categoryIds filter by list of category UUIDs
     * @param brandIds filter by list of brand UUIDs
     * @param minPrice filter by minimum price
     * @param maxPrice filter by maximum price
     * @param keyword search keyword matching names or slugs
     * @param pageable pagination parameters (page, size, sorting)
     * @return a ResponseEntity containing a pageable list of products matching the criteria
     */
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

    /**
     * Retrieves details of a product by its SEO slug.
     * Includes variants, specifications, images, and FAQs.
     * This endpoint is public.
     *
     * @param slug the SEO-friendly URL slug of the product
     * @return a ResponseEntity containing the product details
     */
    @GetMapping("/public/products/{slug}")
    @Operation(summary = "Get product by slug (public)")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductBySlug(slug)));
    }

    /**
     * Performs a text-based search on products.
     * This endpoint is public.
     *
     * @param keyword search term matched against product titles, tags, and description
     * @param pageable pagination parameters
     * @return a ResponseEntity containing a pageable list of matching products
     */
    @GetMapping("/public/products/search")
    @Operation(summary = "Search products")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> searchProducts(
            @RequestParam String keyword, @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(productService.searchProducts(keyword, pageable)));
    }

    /**
     * Retrieves products under a specific category.
     * This endpoint is public.
     *
     * @param categoryId unique UUID of the category
     * @param pageable pagination parameters
     * @return a ResponseEntity containing a pageable list of products under the category
     */
    @GetMapping("/public/products/category/{categoryId}")
    @Operation(summary = "Get products by category")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getByCategory(
            @PathVariable UUID categoryId, @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductsByCategory(categoryId, pageable)));
    }

    /**
     * Retrieves products under a specific brand.
     * This endpoint is public.
     *
     * @param brandId unique UUID of the brand
     * @param pageable pagination parameters
     * @return a ResponseEntity containing a pageable list of products under the brand
     */
    @GetMapping("/public/products/brand/{brandId}")
    @Operation(summary = "Get products by brand")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getByBrand(
            @PathVariable UUID brandId, @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductsByBrand(brandId, pageable)));
    }

    /**
     * Retrieves a list of featured products to display on targeted sections of the storefront.
     * This endpoint is public.
     *
     * @return a ResponseEntity containing the list of featured products
     */
    @GetMapping("/public/products/featured")
    @Operation(summary = "Get featured products")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getFeatured() {
        return ResponseEntity.ok(ApiResponse.success(productService.getFeaturedProducts()));
    }

    /**
     * Retrieves trending products based on sales volume or views.
     * This endpoint is public.
     *
     * @return a ResponseEntity containing the list of trending products
     */
    @GetMapping("/public/products/trending")
    @Operation(summary = "Get trending products")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getTrending() {
        return ResponseEntity.ok(ApiResponse.success(productService.getTrendingProducts()));
    }

    /**
     * Retrieves products currently on active flash sale promotions.
     * This endpoint is public.
     *
     * @return a ResponseEntity containing the list of flash sale products
     */
    @GetMapping("/public/products/flash-sale")
    @Operation(summary = "Get flash sale products")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getFlashSale() {
        return ResponseEntity.ok(ApiResponse.success(productService.getFlashSaleProducts()));
    }

    // --- Admin endpoints ---

    /**
     * Retrieves all products in the system (published, draft, archived) matching optional search criteria.
     * Restricted to admin, product manager, or inventory manager roles.
     *
     * @param status optional status filter (e.g. PUBLISHED, DRAFT)
     * @param keyword optional search term matching product names or descriptions
     * @param pageable pagination parameters
     * @return a ResponseEntity containing a pageable list of products
     */
    @GetMapping("/admin/products")
    @PreAuthorize("hasAnyRole('ADMIN','PRODUCT_MANAGER','INVENTORY_MANAGER')")
    @Operation(summary = "Get all products (admin)")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getAllProducts(
            @RequestParam(required = false) ProductStatus status,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(productService.getAllProducts(status, keyword, pageable)));
    }

    /**
     * Retrieves a detailed view of any product by its UUID.
     * Restricted to admin, product manager, or inventory manager roles.
     *
     * @param id unique UUID of the product
     * @return a ResponseEntity containing the product details
     */
    @GetMapping("/admin/products/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PRODUCT_MANAGER','INVENTORY_MANAGER')")
    @Operation(summary = "Get product by ID (admin)")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductById(id)));
    }

    /**
     * Creates a new product catalog entry along with its variants, specifications, images, and FAQs.
     * Restricted to admin or product manager roles.
     *
     * @param request the request payload containing full product configurations
     * @return a ResponseEntity containing the created product details
     */
    @PostMapping("/admin/products")
    @PreAuthorize("hasAnyRole('ADMIN','PRODUCT_MANAGER')")
    @Operation(summary = "Create product")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(@Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Product created", response));
    }

    /**
     * Updates an existing product catalog entry.
     * Restricted to admin or product manager roles.
     *
     * @param id unique UUID of the product to update
     * @param request the updated product details
     * @return a ResponseEntity containing the updated product details
     */
    @PutMapping("/admin/products/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PRODUCT_MANAGER')")
    @Operation(summary = "Update product")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable UUID id, @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Product updated", productService.updateProduct(id, request)));
    }

    /**
     * Deletes a product catalog entry.
     * Restricted strictly to users with the ADMIN role.
     *
     * @param id unique UUID of the product to delete
     * @return a ResponseEntity indicating successful deletion
     */
    @DeleteMapping("/admin/products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete product")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable UUID id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted"));
    }

    /**
     * Deletes multiple product entries in a bulk action.
     * Restricted strictly to users with the ADMIN role.
     *
     * @param ids list of unique UUIDs of products to delete
     * @return a ResponseEntity indicating successful deletion
     */
    @DeleteMapping("/admin/products/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bulk delete products")
    public ResponseEntity<ApiResponse<Void>> deleteProducts(@RequestBody List<UUID> ids) {
        productService.deleteProducts(ids);
        return ResponseEntity.ok(ApiResponse.success("Products deleted successfully"));
    }

    /**
     * Retrieves products with low inventory stock levels based on thresholds.
     * Restricted to admin or inventory manager roles.
     *
     * @return a ResponseEntity containing the list of low stock products
     */
    @GetMapping("/admin/products/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER')")
    @Operation(summary = "Get low stock products")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getLowStock() {
        return ResponseEntity.ok(ApiResponse.success(productService.getLowStockProducts()));
    }

    /**
     * Performs a quick adjustment to a product's stock levels.
     * Restricted to admin or inventory manager roles.
     *
     * @param id unique UUID of the product
     * @param request payload containing the adjustment quantity and operation type (ADD or SET)
     * @return a ResponseEntity containing the updated product details
     */
    @PatchMapping("/admin/products/{id}/stock")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER')")
    @Operation(summary = "Quick update stock")
    public ResponseEntity<ApiResponse<ProductResponse>> updateStock(
            @PathVariable UUID id, @RequestBody StockUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Stock updated", 
                productService.updateStock(id, request.getQuantity(), request.getOperation())));
    }
}
