package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.ApiResponse;
import com.ecommerce.backend.dto.category.CategoryRequest;
import com.ecommerce.backend.dto.category.CategoryResponse;
import com.ecommerce.backend.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Category Controller
 *
 * Exposes endpoints for managing product categories.
 * Supports a hierarchical category structure (parent-child relationships).
 * Provides public endpoints for catalog browsing and admin/manager endpoints for CRUD operations.
 */
@RestController
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Category management")
public class CategoryController {

    /**
     * Service handling the business logic for categories.
     */
    private final CategoryService categoryService;

    // --- Public endpoints ---

    /**
     * Retrieves the complete category tree structure.
     * This endpoint is public and organizes categories hierarchically (root categories with nested subcategories).
     *
     * @return a ResponseEntity containing the hierarchical list of category responses
     */
    @GetMapping("/public/categories")
    @Operation(summary = "Get category tree (public)")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategoryTree() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getCategoryTree()));
    }

    /**
     * Retrieves details of a specific category by its SEO slug.
     * This endpoint is public.
     *
     * @param slug the unique SEO-friendly identifier of the category
     * @return a ResponseEntity containing the category details
     */
    @GetMapping("/public/categories/{slug}")
    @Operation(summary = "Get category by slug (public)")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getCategoryBySlug(slug)));
    }

    /**
     * Retrieves direct subcategories for a given category ID.
     * This endpoint is public.
     *
     * @param id the unique UUID of the parent category
     * @return a ResponseEntity containing the list of subcategories
     */
    @GetMapping("/public/categories/{id}/subcategories")
    @Operation(summary = "Get subcategories (public)")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getSubcategories(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getSubcategories(id)));
    }

    // --- Admin endpoints ---

    /**
     * Retrieves a flat list of all categories in the system.
     * Restricted to admin or product manager users.
     *
     * @return a ResponseEntity containing a list of all categories
     */
    @GetMapping("/admin/categories")
    @PreAuthorize("hasAnyRole('ADMIN','PRODUCT_MANAGER')")
    @Operation(summary = "Get all categories (admin)")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getAllCategories()));
    }

    /**
     * Retrieves category details by its UUID.
     * Restricted to admin or product manager users.
     *
     * @param id the unique UUID of the category
     * @return a ResponseEntity containing the category details
     */
    @GetMapping("/admin/categories/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PRODUCT_MANAGER')")
    @Operation(summary = "Get category by ID (admin)")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getCategoryById(id)));
    }

    /**
     * Creates a new category in the system.
     * Supports specifying a parent category ID to create subcategories.
     * Restricted to admin or product manager users.
     *
     * @param request the request body containing category configuration (names, slug, parentId, logo, banner, active state)
     * @return a ResponseEntity containing the created category details
     */
    @PostMapping("/admin/categories")
    @PreAuthorize("hasAnyRole('ADMIN','PRODUCT_MANAGER')")
    @Operation(summary = "Create category")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CategoryRequest request) {
        CategoryResponse response = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Category created", response));
    }

    /**
     * Updates an existing category configuration.
     * Restricted to admin or product manager users.
     *
     * @param id the unique UUID of the category to update
     * @param request the updated category details
     * @return a ResponseEntity containing the updated category details
     */
    @PutMapping("/admin/categories/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PRODUCT_MANAGER')")
    @Operation(summary = "Update category")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(@PathVariable UUID id, @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Category updated", categoryService.updateCategory(id, request)));
    }

    /**
     * Deletes a category by its UUID.
     * Restricted strictly to users with the ADMIN role.
     *
     * @param id the unique UUID of the category to delete
     * @return a ResponseEntity indicating successful deletion
     */
    @DeleteMapping("/admin/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete category")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable UUID id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted"));
    }

    /**
     * Deletes multiple categories in a bulk action.
     * Restricted strictly to users with the ADMIN role.
     *
     * @param ids list of unique UUIDs of the categories to delete
     * @return a ResponseEntity indicating successful deletion
     */
    @DeleteMapping("/admin/categories/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bulk delete categories")
    public ResponseEntity<ApiResponse<Void>> deleteCategories(@RequestBody List<UUID> ids) {
        categoryService.deleteCategories(ids);
        return ResponseEntity.ok(ApiResponse.success("Categories deleted successfully"));
    }
}
