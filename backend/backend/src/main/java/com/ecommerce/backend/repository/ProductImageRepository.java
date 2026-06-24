package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Product Image Repository
 *
 * Provides database access operations for the ProductImage entity.
 */
@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, UUID> {

    /**
     * Retrieves all product images associated with a product, sorted by display order.
     *
     * @param productId unique product UUID
     * @return list of product images
     */
    List<ProductImage> findByProductIdOrderByDisplayOrderAsc(UUID productId);

    /**
     * Deletes all product images associated with a product.
     *
     * @param productId unique product UUID
     */
    void deleteByProductId(UUID productId);
}
