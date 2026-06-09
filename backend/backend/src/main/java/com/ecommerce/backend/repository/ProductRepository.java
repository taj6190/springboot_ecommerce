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

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {

    Optional<Product> findByUrlSlug(String urlSlug);
    Optional<Product> findBySku(String sku);
    boolean existsBySku(String sku);
    boolean existsByUrlSlug(String urlSlug);

    Page<Product> findByStatus(ProductStatus status, Pageable pageable);
    Page<Product> findByCategoryIdAndStatus(UUID categoryId, ProductStatus status, Pageable pageable);
    Page<Product> findByBrandIdAndStatus(UUID brandId, ProductStatus status, Pageable pageable);

    // Featured, trending, bestseller queries
    List<Product> findByFeaturedTrueAndStatusOrderByCreatedAtDesc(ProductStatus status);
    List<Product> findByTrendingTrueAndStatusOrderByCreatedAtDesc(ProductStatus status);
    List<Product> findByBestSellerTrueAndStatusOrderByCreatedAtDesc(ProductStatus status);

    // Flash sale products
    @Query("SELECT p FROM Product p WHERE p.flashSaleActive = true AND p.status = 'PUBLISHED' AND p.saleEndTime > CURRENT_TIMESTAMP")
    List<Product> findActiveFlashSaleProducts();

    // Low stock products
    @Query("SELECT p FROM Product p WHERE p.stockQuantity <= p.lowStockThreshold AND p.status = 'PUBLISHED'")
    List<Product> findLowStockProducts();

    // Pessimistic lock for stock deduction during checkout
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdWithLock(@Param("id") UUID id);

    // Search
    @Query("SELECT p FROM Product p WHERE p.status = 'PUBLISHED' AND " +
            "(LOWER(p.nameEn) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.nameBn) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.shortDescEn) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Product> searchProducts(@Param("keyword") String keyword, Pageable pageable);

    // Count by category
    long countByCategoryIdAndStatus(UUID categoryId, ProductStatus status);
    long countByCategoryId(UUID categoryId);
    long countByBrandId(UUID brandId);

    @Query(value = "SELECT COUNT(*) FROM order_items WHERE product_id = :id", nativeQuery = true)
    long countOrderItemsByProductId(@Param("id") UUID id);

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "DELETE FROM wishlists WHERE product_id = :id", nativeQuery = true)
    void deleteWishlistsByProductId(@Param("id") UUID id);

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "DELETE FROM reviews WHERE product_id = :id", nativeQuery = true)
    void deleteReviewsByProductId(@Param("id") UUID id);

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "DELETE FROM product_change_history WHERE product_id = :id", nativeQuery = true)
    void deleteHistoryByProductId(@Param("id") UUID id);

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "DELETE FROM product_cross_sell WHERE product_id = :id OR cross_sell_product_id = :id", nativeQuery = true)
    void deleteCrossSellsByProductId(@Param("id") UUID id);

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "DELETE FROM product_upsell WHERE product_id = :id OR upsell_product_id = :id", nativeQuery = true)
    void deleteUpSellsByProductId(@Param("id") UUID id);
    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "DELETE FROM product_tags WHERE product_id = :id", nativeQuery = true)
    void deleteTagsByProductId(@Param("id") UUID id);

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "DELETE FROM product_images WHERE product_id = :id", nativeQuery = true)
    void deleteImagesByProductId(@Param("id") UUID id);

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "DELETE FROM product_variants WHERE product_id = :id", nativeQuery = true)
    void deleteVariantsByProductId(@Param("id") UUID id);

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "DELETE FROM product_faqs WHERE product_id = :id", nativeQuery = true)
    void deleteFaqsByProductId(@Param("id") UUID id);
}
