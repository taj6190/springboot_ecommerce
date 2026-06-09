package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    Page<Review> findByProductIdAndApprovedTrueOrderByCreatedAtDesc(UUID productId, Pageable pageable);
    Page<Review> findByApprovedFalseOrderByCreatedAtDesc(Pageable pageable);
    Page<Review> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    boolean existsByProductIdAndUserId(UUID productId, UUID userId);

    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Review r WHERE r.product.id = :productId AND r.approved = true")
    BigDecimal calculateAverageRating(@Param("productId") UUID productId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId AND r.approved = true")
    int countApprovedReviewsByProductId(@Param("productId") UUID productId);
}
