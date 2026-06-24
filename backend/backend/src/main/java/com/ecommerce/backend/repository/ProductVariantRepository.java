package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Product Variant Repository
 *
 * Provides database access operations for the ProductVariant entity.
 */
@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, UUID> {

    /**
     * Finds all product variants associated with a product UUID.
     *
     * @param productId unique product UUID
     * @return list of product variants
     */
    List<ProductVariant> findByProductId(UUID productId);

    /**
     * Finds a variant by its unique SKU code.
     *
     * @param sku unique SKU code
     * @return an Optional containing the variant if found
     */
    Optional<ProductVariant> findBySku(String sku);

    /**
     * Checks if a variant SKU is already registered in the system.
     *
     * @param sku unique SKU code
     * @return true if it exists, false otherwise
     */
    boolean existsBySku(String sku);

    /**
     * Finds a product variant and applies a pessimistic write lock for thread-safe stock deduction.
     *
     * @param id unique product variant UUID
     * @return an Optional containing the locked variant if found
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT v FROM ProductVariant v WHERE v.id = :id")
    Optional<ProductVariant> findByIdWithLock(@Param("id") UUID id);
}
