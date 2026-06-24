package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Category Repository
 *
 * Provides database access operations for the Category entity.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {

    /**
     * Finds a category by its unique URL slug.
     *
     * @param slug unique SEO slug
     * @return an Optional containing the category if found
     */
    Optional<Category> findBySlug(String slug);

    /**
     * Checks if a category exists with the given URL slug.
     *
     * @param slug unique SEO slug
     * @return true if a category exists with the slug, false otherwise
     */
    boolean existsBySlug(String slug);

    /**
     * Retrieves all active root-level categories (no parent) sorted by display order.
     *
     * @return list of active root categories
     */
    List<Category> findByParentIsNullAndActiveTrueOrderByDisplayOrderAsc();

    /**
     * Retrieves active subcategories for a parent category, sorted by display order.
     *
     * @param parentId unique parent category UUID
     * @return list of active subcategories
     */
    List<Category> findByParentIdAndActiveTrueOrderByDisplayOrderAsc(UUID parentId);

    /**
     * Retrieves root categories pre-fetching children to avoid N+1 queries.
     *
     * @return list of active root categories with initialized children
     */
    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.children WHERE c.parent IS NULL AND c.active = true ORDER BY c.displayOrder")
    List<Category> findAllRootCategoriesWithChildren();

    /**
     * Retrieves all active categories.
     *
     * @return list of active categories
     */
    List<Category> findByActiveTrue();

    /**
     * Counts direct subcategories under a specific category.
     *
     * @param parentId unique parent category UUID
     * @return count of subcategories
     */
    long countByParentId(UUID parentId);
}
