package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.ApiResponse;
import com.ecommerce.backend.dto.product.WishlistResponse;
import com.ecommerce.backend.security.CustomUserDetails;
import com.ecommerce.backend.service.WishlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/wishlist")
@RequiredArgsConstructor
@Tag(name = "Wishlist", description = "Customer wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    @Operation(summary = "Get my wishlist")
    public ResponseEntity<ApiResponse<Page<WishlistResponse>>> getWishlist(
            @AuthenticationPrincipal CustomUserDetails user,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(wishlistService.getUserWishlist(user.getId(), pageable)));
    }

    @PostMapping("/{productId}")
    @Operation(summary = "Add to wishlist")
    public ResponseEntity<ApiResponse<Void>> add(
            @PathVariable UUID productId,
            @AuthenticationPrincipal CustomUserDetails user) {
        wishlistService.addToWishlist(user.getId(), productId);
        return ResponseEntity.ok(ApiResponse.success("Added to wishlist"));
    }

    @DeleteMapping("/{productId}")
    @Operation(summary = "Remove from wishlist")
    public ResponseEntity<ApiResponse<Void>> remove(
            @PathVariable UUID productId,
            @AuthenticationPrincipal CustomUserDetails user) {
        wishlistService.removeFromWishlist(user.getId(), productId);
        return ResponseEntity.ok(ApiResponse.success("Removed from wishlist"));
    }

    @GetMapping("/{productId}/check")
    @Operation(summary = "Check if product is in wishlist")
    public ResponseEntity<ApiResponse<Boolean>> check(
            @PathVariable UUID productId,
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(wishlistService.isInWishlist(user.getId(), productId)));
    }
}
