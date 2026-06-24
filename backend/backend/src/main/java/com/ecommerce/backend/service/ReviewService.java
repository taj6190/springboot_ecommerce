package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Review;
import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.exception.BadRequestException;
import com.ecommerce.backend.exception.DuplicateResourceException;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.repository.OrderItemRepository;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.repository.ReviewRepository;
import com.ecommerce.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Review Service
 *
 * Handles the business logic for customer product reviews and ratings.
 * Manages review submission, verification of purchases, and admin moderation workflow (approval and rejection).
 * Re-calculates and updates the associated product's average rating and review counts on approval changes.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    /**
     * Repository interface for querying and saving customer reviews.
     */
    private final ReviewRepository reviewRepository;

    /**
     * Repository interface for updating average ratings on target products.
     */
    private final ProductRepository productRepository;

    /**
     * Repository interface to associate the customer with the review.
     */
    private final UserRepository userRepository;

    /**
     * Repository interface to verify whether the reviewer purchased the product.
     */
    private final OrderItemRepository orderItemRepository;

    /**
     * Submits a product review for validation.
     * Checks if the user already reviewed the product, verifies if the user purchased it,
     * and sets the review status to unapproved pending admin review.
     *
     * @param userId unique UUID of the customer reviewer
     * @param productId unique UUID of the product being rated
     * @param rating score out of 5 stars (from 1 to 5)
     * @param comment description/review content
     * @return the created Review details
     * @throws BadRequestException if the rating is out of bounds (not 1 to 5)
     * @throws DuplicateResourceException if the customer has already submitted a review for this product
     * @throws ResourceNotFoundException if the user or product records are missing
     */
    @Transactional
    public Review submitReview(UUID userId, UUID productId, int rating, String comment) {
        if (rating < 1 || rating > 5) {
            throw new BadRequestException("Rating must be between 1 and 5");
        }

        if (reviewRepository.existsByProductIdAndUserId(productId, userId)) {
            throw new DuplicateResourceException("You have already reviewed this product");
        }

        var user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        var product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        boolean verifiedPurchase = orderItemRepository.existsByOrderUserIdAndProductId(userId, productId);

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(rating)
                .comment(comment)
                .verifiedPurchase(verifiedPurchase)
                .approved(false) // Requires admin approval
                .build();

        review = reviewRepository.save(review);
        log.info("Review submitted for product {} by user {}", productId, userId);
        return review;
    }

    /**
     * Approves a customer review, rendering it visible on public storefront screens.
     * Triggers a recalculation of the product's average rating scores.
     *
     * @param reviewId unique UUID of the review to approve
     * @return approved Review details
     * @throws ResourceNotFoundException if the review is not found
     */
    @Transactional
    public Review approveReview(UUID reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));
        review.setApproved(true);
        review = reviewRepository.save(review);

        // Update product average rating
        updateProductRating(review.getProduct().getId());
        return review;
    }

    /**
     * Rejects/deletes a customer review from the database.
     * Triggers a recalculation of the product's average rating scores if it was previously approved.
     *
     * @param reviewId unique UUID of the review to reject
     * @throws ResourceNotFoundException if the review is not found
     */
    @Transactional
    public void rejectReview(UUID reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));
        reviewRepository.delete(review);

        updateProductRating(review.getProduct().getId());
    }

    /**
     * Retrieves approved reviews for a product with pagination.
     *
     * @param productId unique UUID of the product
     * @param pageable pagination parameters
     * @return page of approved Review records
     */
    @Transactional(readOnly = true)
    public Page<Review> getApprovedReviews(UUID productId, Pageable pageable) {
        return reviewRepository.findByProductIdAndApprovedTrueOrderByCreatedAtDesc(productId, pageable);
    }

    /**
     * Retrieves pending reviews awaiting admin approval with pagination.
     *
     * @param pageable pagination parameters
     * @return page of pending Review records
     */
    @Transactional(readOnly = true)
    public Page<Review> getPendingReviews(Pageable pageable) {
        return reviewRepository.findByApprovedFalseOrderByCreatedAtDesc(pageable);
    }

    /**
     * Internal helper to recalculate average rating and review counts on a product.
     *
     * @param productId unique UUID of the product
     */
    private void updateProductRating(UUID productId) {
        BigDecimal avgRating = reviewRepository.calculateAverageRating(productId);
        int reviewCount = reviewRepository.countApprovedReviewsByProductId(productId);

        Product product = productRepository.findById(productId).orElse(null);
        if (product != null) {
            product.setAvgRating(avgRating);
            product.setReviewCount(reviewCount);
            productRepository.save(product);
        }
    }
}
