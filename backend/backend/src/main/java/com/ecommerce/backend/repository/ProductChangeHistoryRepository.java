package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.ProductChangeHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * Product Change History Repository
 *
 * Provides database access operations for the ProductChangeHistory entity.
 */
@Repository
public interface ProductChangeHistoryRepository extends JpaRepository<ProductChangeHistory, UUID> {

    /**
     * Retrieves audit change logs for a product, sorted from newest to oldest with pagination.
     *
     * @param productId unique product UUID
     * @param pageable pagination parameters
     * @return page of audit logs
     */
    Page<ProductChangeHistory> findByProductIdOrderByChangedAtDesc(UUID productId, Pageable pageable);
}
