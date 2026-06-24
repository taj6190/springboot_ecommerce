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

/**
 * Wishlist Controller
 *
 * Exposes endpoints for customer wishlists, allowing users to save items for future reference or purchasing.
 * Requires authenticated customer access.
 */
@RestController
@RequestMapping("/wishlist")
@RequiredArgsConstructor
@Tag(name = "Wishlist", description = "Customer wishlist")
public class WishlistController {

    /**
     * Service handling the business logic for adding, checking, and removing wishlist items.
     */
    private final WishlistService wishlistService;

    /**
     * Retrieves the wishlist items for the logged-in customer.
     *
     * @param user details of the authenticated customer
     * @param pageable pagination parameters
     * @return a ResponseEntity containing a pageable list of wishlist items
     */
    @GetMapping
    @Operation(summary = "Get my wishlist")
    public ResponseEntity<ApiResponse<Page<WishlistResponse>>> getWishlist(
            @AuthenticationPrincipal CustomUserDetails user,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(wishlistService.getUserWishlist(user.getId(), pageable)));
    }

    /**
     * Adds a product to the authenticated user's wishlist.
     *
     * @param productId unique UUID of the product to add
     * @param user details of the authenticated customer
     * @return a ResponseEntity indicating successful addition
     */
    @PostMapping("/{productId}")
    @Operation(summary = "Add to wishlist")
    public ResponseEntity<ApiResponse<Void>> add(
            @PathVariable UUID productId,
            @AuthenticationPrincipal CustomUserDetails user) {
        wishlistService.addToWishlist(user.getId(), productId);
        return ResponseEntity.ok(ApiResponse.success("Added to wishlist"));
    }

    /**
     * Removes a product from the authenticated user's wishlist.
     *
     * @param productId unique UUID of the product to remove
     * @param user details of the authenticated customer
     * @return a ResponseEntity indicating successful removal
     */
    @DeleteMapping("/{productId}")
    @Operation(summary = "Remove from wishlist")
    public ResponseEntity<ApiResponse<Void>> remove(
            @PathVariable UUID productId,
            @AuthenticationPrincipal CustomUserDetails user) {
        wishlistService.removeFromWishlist(user.getId(), productId);
        return ResponseEntity.ok(ApiResponse.success("Removed from wishlist"));
    }

    /**
     * Checks whether a specific product is currently saved in the authenticated user's wishlist.
     *
     * @param productId unique UUID of the product
     * @param user details of the authenticated customer
     * @return a ResponseEntity containing true if in wishlist, false otherwise
     */
    @GetMapping("/{productId}/check")
    @Operation(summary = "Check if product is in wishlist")
    public ResponseEntity<ApiResponse<Boolean>> check(
            @PathVariable UUID productId,
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(wishlistService.isInWishlist(user.getId(), productId)));
    }
}
