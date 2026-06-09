package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.ApiResponse;
import com.ecommerce.backend.entity.Review;
import com.ecommerce.backend.security.CustomUserDetails;
import com.ecommerce.backend.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Product reviews")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/public/products/{productId}/reviews")
    @Operation(summary = "Get approved reviews for a product")
    public ResponseEntity<ApiResponse<Page<Review>>> getReviews(
            @PathVariable UUID productId, @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getApprovedReviews(productId, pageable)));
    }

    @PostMapping("/reviews/{productId}")
    @Operation(summary = "Submit a review")
    public ResponseEntity<ApiResponse<Review>> submitReview(
            @PathVariable UUID productId,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal CustomUserDetails user) {
        int rating = (int) body.get("rating");
        String comment = (String) body.get("comment");
        Review review = reviewService.submitReview(user.getId(), productId, rating, comment);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Review submitted for approval", review));
    }

    @GetMapping("/admin/reviews/pending")
    @PreAuthorize("hasAnyRole('ADMIN','CONTENT_EDITOR')")
    @Operation(summary = "Get pending reviews")
    public ResponseEntity<ApiResponse<Page<Review>>> getPending(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getPendingReviews(pageable)));
    }

    @PatchMapping("/admin/reviews/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','CONTENT_EDITOR')")
    @Operation(summary = "Approve a review")
    public ResponseEntity<ApiResponse<Review>> approve(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Review approved", reviewService.approveReview(id)));
    }

    @DeleteMapping("/admin/reviews/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','CONTENT_EDITOR')")
    @Operation(summary = "Reject/delete a review")
    public ResponseEntity<ApiResponse<Void>> reject(@PathVariable UUID id) {
        reviewService.rejectReview(id);
        return ResponseEntity.ok(ApiResponse.success("Review rejected"));
    }
}
