package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.category.CategoryRequest;
import com.ecommerce.backend.dto.category.CategoryResponse;
import com.ecommerce.backend.entity.Category;
import com.ecommerce.backend.exception.DuplicateResourceException;
import com.ecommerce.backend.exception.BadRequestException;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.repository.CategoryRepository;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.util.SlugUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Category Service
 *
 * Handles the business logic for hierarchical product categories.
 * Provides APIs for generating category trees, fetching parent-child layouts, and administering categories.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService {

    /**
     * Repository interface for querying and saving category records in the database.
     */
    private final CategoryRepository categoryRepository;

    /**
     * Repository interface for verifying that no active products are associated with a category before deletion.
     */
    private final ProductRepository productRepository;

    /**
     * Retrieves the entire hierarchical tree of active categories (root categories with nested child subcategories).
     * Results are cached for better catalog load performance.
     *
     * @return hierarchical list of CategoryResponse objects
     */
    @Cacheable(value = "categories", key = "'tree'")
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoryTree() {
        List<Category> roots = categoryRepository.findByParentIsNullAndActiveTrueOrderByDisplayOrderAsc();
        return roots.stream()
                .map(this::mapToResponseWithChildren)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves all categories in a flat list layout.
     * Results are cached for performance.
     *
     * @return flat list of CategoryResponse objects
     */
    @Cacheable(value = "categories", key = "'all'")
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves details of a specific category by its unique UUID.
     *
     * @param id unique UUID of the category
     * @return CategoryResponse details containing nested child subcategories
     * @throws ResourceNotFoundException if the category is not found
     */
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return mapToResponseWithChildren(category);
    }

    /**
     * Retrieves a category configuration by its unique SEO slug.
     *
     * @param slug unique SEO slug of the category
     * @return CategoryResponse details containing nested child subcategories
     * @throws ResourceNotFoundException if no matching category is found
     */
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "slug", slug));
        return mapToResponseWithChildren(category);
    }

    /**
     * Creates a new category. Supports setting parent links to create hierarchical structures.
     * Evicts categories cache to sync the state.
     *
     * @param request configuration details for the new category
     * @return the created CategoryResponse details
     * @throws ResourceNotFoundException if parentId is supplied but the parent category is not found
     */
    @CacheEvict(value = "categories", allEntries = true)
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        String slug = SlugUtil.toUniqueSlug(request.getNameEn(), categoryRepository::existsBySlug);

        Category category = Category.builder()
                .nameEn(request.getNameEn())
                .nameBn(request.getNameBn())
                .slug(slug)
                .descriptionEn(request.getDescriptionEn())
                .descriptionBn(request.getDescriptionBn())
                .imageUrl(request.getImageUrl())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent Category", "id", request.getParentId()));
            category.setParent(parent);
            category.setLevel(parent.getLevel() + 1);
        }

        category = categoryRepository.save(category);
        log.info("Category created: {} (slug: {})", category.getNameEn(), category.getSlug());
        return mapToResponse(category);
    }

    /**
     * Updates an existing category configuration.
     * Evicts categories cache.
     *
     * @param id unique UUID of the category to update
     * @param request updated configurations
     * @return the updated CategoryResponse details
     * @throws ResourceNotFoundException if the target or target's new parent category does not exist
     */
    @CacheEvict(value = "categories", allEntries = true)
    @Transactional
    public CategoryResponse updateCategory(UUID id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        category.setNameEn(request.getNameEn());
        if (request.getNameBn() != null) category.setNameBn(request.getNameBn());
        if (request.getDescriptionEn() != null) category.setDescriptionEn(request.getDescriptionEn());
        if (request.getDescriptionBn() != null) category.setDescriptionBn(request.getDescriptionBn());
        if (request.getImageUrl() != null) category.setImageUrl(request.getImageUrl());
        if (request.getDisplayOrder() != null) category.setDisplayOrder(request.getDisplayOrder());
        if (request.getActive() != null) category.setActive(request.getActive());

        if (request.getParentId() != null && !request.getParentId().equals(
                category.getParent() != null ? category.getParent().getId() : null)) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent Category", "id", request.getParentId()));
            category.setParent(parent);
            category.setLevel(parent.getLevel() + 1);
        }

        // Regenerate slug if name changed
        String newSlug = SlugUtil.toSlug(request.getNameEn());
        if (!newSlug.equals(category.getSlug())) {
            category.setSlug(SlugUtil.toUniqueSlug(request.getNameEn(), categoryRepository::existsBySlug));
        }

        category = categoryRepository.save(category);
        log.info("Category updated: {}", category.getId());
        return mapToResponse(category);
    }

    /**
     * Deletes a category by its UUID.
     * Rejects deletion if it has nested subcategories or contains active products.
     * Evicts categories cache.
     *
     * @param id unique UUID of the category to delete
     * @throws ResourceNotFoundException if category does not exist
     * @throws BadRequestException if nested subcategories or products are linked
     */
    @CacheEvict(value = "categories", allEntries = true)
    @Transactional
    public void deleteCategory(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        // Check for subcategories
        long subcategoryCount = categoryRepository.countByParentId(id);
        if (subcategoryCount > 0) {
            throw new BadRequestException("Cannot delete category because it has " + subcategoryCount + " subcategories. Please delete subcategories first.");
        }

        // Check for products
        long productCount = productRepository.countByCategoryId(id);
        if (productCount > 0) {
            throw new BadRequestException("Cannot delete category because it contains " + productCount + " products. Please move or delete products first.");
        }

        categoryRepository.delete(category);
        log.info("Category deleted: {}", id);
    }

    /**
     * Bulk deletes multiple categories. Performs validation on each category before deleting.
     * Evicts categories cache.
     *
     * @param ids list of category UUIDs to delete
     */
    @CacheEvict(value = "categories", allEntries = true)
    @Transactional
    public void deleteCategories(List<UUID> ids) {
        ids.forEach(this::deleteCategory);
    }

    /**
     * Retrieves direct active subcategories for a given parent category ID.
     *
     * @param parentId unique UUID of the parent category
     * @return list of subcategories mapped to CategoryResponse
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse> getSubcategories(UUID parentId) {
        return categoryRepository.findByParentIdAndActiveTrueOrderByDisplayOrderAsc(parentId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // --- Mappers ---

    /**
     * Maps a Category database entity to a CategoryResponse DTO (flat).
     *
     * @param category the database entity
     * @return mapped CategoryResponse details
     */
    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .nameEn(category.getNameEn())
                .nameBn(category.getNameBn())
                .slug(category.getSlug())
                .descriptionEn(category.getDescriptionEn())
                .descriptionBn(category.getDescriptionBn())
                .imageUrl(category.getImageUrl())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .parentName(category.getParent() != null ? category.getParent().getNameEn() : null)
                .displayOrder(category.getDisplayOrder())
                .active(category.isActive())
                .level(category.getLevel())
                .build();
    }

    /**
     * Maps a Category database entity to a CategoryResponse, recursively mapping active children.
     *
     * @param category the database entity
     * @return CategoryResponse with children
     */
    private CategoryResponse mapToResponseWithChildren(Category category) {
        CategoryResponse response = mapToResponse(category);
        if (category.getChildren() != null && !category.getChildren().isEmpty()) {
            response.setChildren(category.getChildren().stream()
                    .filter(Category::isActive)
                    .map(this::mapToResponseWithChildren)
                    .collect(Collectors.toList()));
        }
        return response;
    }
}
