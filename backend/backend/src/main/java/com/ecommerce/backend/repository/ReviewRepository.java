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

/**
 * Review Repository
 *
 * Provides database access operations for the Review entity.
 */
@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {

    /**
     * Retrieves approved reviews for a product, sorted by creation date descending with pagination.
     *
     * @param productId unique product UUID
     * @param pageable pagination parameters
     * @return page of approved reviews
     */
    Page<Review> findByProductIdAndApprovedTrueOrderByCreatedAtDesc(UUID productId, Pageable pageable);

    /**
     * Retrieves unapproved reviews sorted by creation date descending with pagination.
     *
     * @param pageable pagination parameters
     * @return page of pending reviews
     */
    Page<Review> findByApprovedFalseOrderByCreatedAtDesc(Pageable pageable);

    /**
     * Retrieves reviews written by a user, sorted by creation date descending with pagination.
     *
     * @param userId unique user UUID
     * @param pageable pagination parameters
     * @return page of reviews
     */
    Page<Review> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    /**
     * Checks if a user has already reviewed a product.
     *
     * @param productId unique product UUID
     * @param userId unique user UUID
     * @return true if review exists, false otherwise
     */
    boolean existsByProductIdAndUserId(UUID productId, UUID userId);

    /**
     * Calculates the average rating of all approved reviews for a product.
     *
     * @param productId unique product UUID
     * @return average rating value
     */
    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Review r WHERE r.product.id = :productId AND r.approved = true")
    BigDecimal calculateAverageRating(@Param("productId") UUID productId);

    /**
     * Counts approved reviews associated with a product.
     *
     * @param productId unique product UUID
     * @return count of approved reviews
     */
    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId AND r.approved = true")
    int countApprovedReviewsByProductId(@Param("productId") UUID productId);
}
