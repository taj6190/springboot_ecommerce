package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Product Repository
 *
 * Provides database access operations for the Product entity.
 * Uses JpaSpecificationExecutor to support rich catalog search filters.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {

    /**
     * Finds a product by its unique SEO url slug.
     *
     * @param urlSlug unique SEO slug
     * @return an Optional containing the product if found
     */
    Optional<Product> findByUrlSlug(String urlSlug);

    /**
     * Finds a product by its unique SKU code.
     *
     * @param sku unique stock keeping unit code
     * @return an Optional containing the product if found
     */
    Optional<Product> findBySku(String sku);

    /**
     * Checks if a product exists with the given SKU.
     *
     * @param sku unique stock keeping unit code
     * @return true if it exists, false otherwise
     */
    boolean existsBySku(String sku);

    /**
     * Checks if a product exists with the given URL slug.
     *
     * @param urlSlug unique SEO slug
     * @return true if it exists, false otherwise
     */
    boolean existsByUrlSlug(String urlSlug);

    /**
     * Finds products in a given status with pagination.
     *
     * @param status product status
     * @param pageable pagination parameters
     * @return page of products
     */
    Page<Product> findByStatus(ProductStatus status, Pageable pageable);

    /**
     * Finds products by category and status with pagination.
     *
     * @param categoryId unique category UUID
     * @param status product status
     * @param pageable pagination parameters
     * @return page of products
     */
    Page<Product> findByCategoryIdAndStatus(UUID categoryId, ProductStatus status, Pageable pageable);

    /**
     * Finds products by brand and status with pagination.
     *
     * @param brandId unique brand UUID
     * @param status product status
     * @param pageable pagination parameters
     * @return page of products
     */
    Page<Product> findByBrandIdAndStatus(UUID brandId, ProductStatus status, Pageable pageable);

    /**
     * Retrieves active featured products sorted by creation date descending.
     *
     * @param status active product status (PUBLISHED)
     * @return list of featured products
     */
    List<Product> findByFeaturedTrueAndStatusOrderByCreatedAtDesc(ProductStatus status);

    /**
     * Retrieves active trending products sorted by creation date descending.
     *
     * @param status active product status (PUBLISHED)
     * @return list of trending products
     */
    List<Product> findByTrendingTrueAndStatusOrderByCreatedAtDesc(ProductStatus status);

    /**
     * Retrieves active best-seller products sorted by creation date descending.
     *
     * @param status active product status (PUBLISHED)
     * @return list of best-seller products
     */
    List<Product> findByBestSellerTrueAndStatusOrderByCreatedAtDesc(ProductStatus status);

    /**
     * Retrieves currently active flash sale products whose sale end time is in the future.
     *
     * @return list of active flash sale products
     */
    @Query("SELECT p FROM Product p WHERE p.flashSaleActive = true AND p.status = 'PUBLISHED' AND p.saleEndTime > CURRENT_TIMESTAMP")
    List<Product> findActiveFlashSaleProducts();

    /**
     * Retrieves published products that are at or below their low stock threshold.
     *
     * @return list of low stock products
     */
    @Query("SELECT p FROM Product p WHERE p.stockQuantity <= p.lowStockThreshold AND p.status = 'PUBLISHED'")
    List<Product> findLowStockProducts();

    /**
     * Finds a product and applies a pessimistic write lock for thread-safe stock deductions.
     *
     * @param id unique product UUID
     * @return an Optional containing the locked product if found
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdWithLock(@Param("id") UUID id);

    /**
     * Performs a text-based search across product names and short descriptions.
     *
     * @param keyword search keyword
     * @param pageable pagination parameters
     * @return page of matching products
     */
    @Query("SELECT p FROM Product p WHERE p.status = 'PUBLISHED' AND " +
            "(LOWER(p.nameEn) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.nameBn) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.shortDescEn) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Product> searchProducts(@Param("keyword") String keyword, Pageable pageable);

    /**
     * Counts active products belonging to a specific category.
     *
     * @param categoryId unique category UUID
     * @param status product status
     * @return count of products
     */
    long countByCategoryIdAndStatus(UUID categoryId, ProductStatus status);

    /**
     * Counts all products associated with a category.
     *
     * @param categoryId unique category UUID
     * @return count of products
     */
    long countByCategoryId(UUID categoryId);

    /**
     * Counts all products associated with a brand.
     *
     * @param brandId unique brand UUID
     * @return count of products
     */
    long countByBrandId(UUID brandId);

    /**
     * Counts how many order item records reference a specific product.
     *
     * @param id unique product UUID
     * @return count of references
     */
    @Query(value = "SELECT COUNT(*) FROM order_items WHERE product_id = :id", nativeQuery = true)
    long countOrderItemsByProductId(@Param("id") UUID id);

    /**
     * Deletes wishlist associations for a product to prevent foreign key violations.
     *
     * @param id unique product UUID
     */
    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "DELETE FROM wishlists WHERE product_id = :id", nativeQuery = true)
    void deleteWishlistsByProductId(@Param("id") UUID id);

    /**
     * Deletes review records associated with a product.
     *
     * @param id unique product UUID
     */
    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "DELETE FROM reviews WHERE product_id = :id", nativeQuery = true)
    void deleteReviewsByProductId(@Param("id") UUID id);

    /**
     * Deletes audit change logs associated with a product.
     *
     * @param id unique product UUID
     */
    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "DELETE FROM product_change_history WHERE product_id = :id", nativeQuery = true)
    void deleteHistoryByProductId(@Param("id") UUID id);

    /**
     * Deletes cross-sell links for a product.
     *
     * @param id unique product UUID
     */
    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "DELETE FROM product_cross_sell WHERE product_id = :id OR cross_sell_product_id = :id", nativeQuery = true)
    void deleteCrossSellsByProductId(@Param("id") UUID id);

    /**
     * Deletes upsell links for a product.
     *
     * @param id unique product UUID
     */
    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "DELETE FROM product_upsell WHERE product_id = :id OR upsell_product_id = :id", nativeQuery = true)
    void deleteUpSellsByProductId(@Param("id") UUID id);

    /**
     * Deletes tag mappings for a product.
     *
     * @param id unique product UUID
     */
    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "DELETE FROM product_tags WHERE product_id = :id", nativeQuery = true)
    void deleteTagsByProductId(@Param("id") UUID id);

    /**
     * Deletes extra images associated with a product.
     *
     * @param id unique product UUID
     */
    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "DELETE FROM product_images WHERE product_id = :id", nativeQuery = true)
    void deleteImagesByProductId(@Param("id") UUID id);

    /**
     * Deletes variants associated with a product.
     *
     * @param id unique product UUID
     */
    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "DELETE FROM product_variants WHERE product_id = :id", nativeQuery = true)
    void deleteVariantsByProductId(@Param("id") UUID id);

    /**
     * Deletes FAQs associated with a product.
     *
     * @param id unique product UUID
     */
    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "DELETE FROM product_faqs WHERE product_id = :id", nativeQuery = true)
    void deleteFaqsByProductId(@Param("id") UUID id);
}
