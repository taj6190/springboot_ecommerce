package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.ProductChangeHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProductChangeHistoryRepository extends JpaRepository<ProductChangeHistory, UUID> {
    Page<ProductChangeHistory> findByProductIdOrderByChangedAtDesc(UUID productId, Pageable pageable);
}
