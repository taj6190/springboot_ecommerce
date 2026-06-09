package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.ProductFaq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductFaqRepository extends JpaRepository<ProductFaq, UUID> {
    List<ProductFaq> findByProductIdOrderByDisplayOrderAsc(UUID productId);
}
