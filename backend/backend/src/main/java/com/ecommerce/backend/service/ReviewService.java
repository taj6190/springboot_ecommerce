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

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderItemRepository orderItemRepository;

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

    @Transactional
    public void rejectReview(UUID reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));
        reviewRepository.delete(review);

        updateProductRating(review.getProduct().getId());
    }

    @Transactional(readOnly = true)
    public Page<Review> getApprovedReviews(UUID productId, Pageable pageable) {
        return reviewRepository.findByProductIdAndApprovedTrueOrderByCreatedAtDesc(productId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Review> getPendingReviews(Pageable pageable) {
        return reviewRepository.findByApprovedFalseOrderByCreatedAtDesc(pageable);
    }

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
