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

@RestController
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Category management")
public class CategoryController {

    private final CategoryService categoryService;

    // --- Public endpoints ---

    @GetMapping("/public/categories")
    @Operation(summary = "Get category tree (public)")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategoryTree() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getCategoryTree()));
    }

    @GetMapping("/public/categories/{slug}")
    @Operation(summary = "Get category by slug (public)")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getCategoryBySlug(slug)));
    }

    @GetMapping("/public/categories/{id}/subcategories")
    @Operation(summary = "Get subcategories (public)")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getSubcategories(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getSubcategories(id)));
    }

    // --- Admin endpoints ---

    @GetMapping("/admin/categories")
    @PreAuthorize("hasAnyRole('ADMIN','PRODUCT_MANAGER')")
    @Operation(summary = "Get all categories (admin)")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getAllCategories()));
    }

    @GetMapping("/admin/categories/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PRODUCT_MANAGER')")
    @Operation(summary = "Get category by ID (admin)")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getCategoryById(id)));
    }

    @PostMapping("/admin/categories")
    @PreAuthorize("hasAnyRole('ADMIN','PRODUCT_MANAGER')")
    @Operation(summary = "Create category")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CategoryRequest request) {
        CategoryResponse response = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Category created", response));
    }

    @PutMapping("/admin/categories/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PRODUCT_MANAGER')")
    @Operation(summary = "Update category")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(@PathVariable UUID id, @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Category updated", categoryService.updateCategory(id, request)));
    }

    @DeleteMapping("/admin/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete category")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable UUID id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted"));
    }

    @DeleteMapping("/admin/categories/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bulk delete categories")
    public ResponseEntity<ApiResponse<Void>> deleteCategories(@RequestBody List<UUID> ids) {
        categoryService.deleteCategories(ids);
        return ResponseEntity.ok(ApiResponse.success("Categories deleted successfully"));
    }
}
