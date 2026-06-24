package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.ProductFaq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Product FAQ Repository
 *
 * Provides database access operations for the ProductFaq entity.
 */
@Repository
public interface ProductFaqRepository extends JpaRepository<ProductFaq, UUID> {

    /**
     * Retrieves FAQs associated with a product, sorted by display order.
     *
     * @param productId unique product UUID
     * @return list of FAQs
     */
    List<ProductFaq> findByProductIdOrderByDisplayOrderAsc(UUID productId);
}
