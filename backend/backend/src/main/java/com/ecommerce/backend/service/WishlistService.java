package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.product.WishlistResponse;
import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.entity.Wishlist;
import com.ecommerce.backend.exception.DuplicateResourceException;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.repository.UserRepository;
import com.ecommerce.backend.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Wishlist Service
 *
 * Handles the business logic for customer wishlists.
 * Manages adding/removing items, checking active entries, and returning detailed profile maps.
 * Recalculates wishlist counters on related Product entities upon save or deletion.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WishlistService {

    /**
     * Repository interface to query and update Wishlist entity states in the database.
     */
    private final WishlistRepository wishlistRepository;

    /**
     * Repository interface to retrieve customer records.
     */
    private final UserRepository userRepository;

    /**
     * Repository interface to fetch and update details of products being saved.
     */
    private final ProductRepository productRepository;

    /**
     * Adds a product to the user's wishlist.
     * Recalculates and updates the product's saved counter.
     *
     * @param userId unique UUID of the customer
     * @param productId unique UUID of the product to add
     * @throws DuplicateResourceException if the product is already saved in the customer's wishlist
     * @throws ResourceNotFoundException if the customer or product records do not exist
     */
    @Transactional
    public void addToWishlist(UUID userId, UUID productId) {
        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new DuplicateResourceException("Product already in wishlist");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        Wishlist wishlist = Wishlist.builder().user(user).product(product).build();
        wishlistRepository.save(wishlist);

        // Update wishlist count on product
        product.setWishlistCount(wishlistRepository.countByProductId(productId));
        productRepository.save(product);
    }

    /**
     * Removes a product from the customer's wishlist.
     * Recalculates and updates the product's saved counter.
     *
     * @param userId unique UUID of the customer
     * @param productId unique UUID of the product to remove
     * @throws ResourceNotFoundException if the wishlist item is not found
     */
    @Transactional
    public void removeFromWishlist(UUID userId, UUID productId) {
        Wishlist wishlist = wishlistRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist item not found"));

        wishlistRepository.delete(wishlist);

        Product product = productRepository.findById(productId).orElse(null);
        if (product != null) {
            product.setWishlistCount(wishlistRepository.countByProductId(productId));
            productRepository.save(product);
        }
    }

    /**
     * Retrieves the wishlist items for a customer in a paginated DTO format.
     *
     * @param userId unique UUID of the customer
     * @param pageable pagination parameters
     * @return page of WishlistResponse objects
     */
    @Transactional(readOnly = true)
    public Page<WishlistResponse> getUserWishlist(UUID userId, Pageable pageable) {
        return wishlistRepository.findByUserIdOrderByAddedAtDesc(userId, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Maps a Wishlist database entity to a WishlistResponse DTO.
     *
     * @param wishlist the wishlist entity record
     * @return mapped WishlistResponse details
     */
    private WishlistResponse mapToResponse(Wishlist wishlist) {
        Product p = wishlist.getProduct();
        return WishlistResponse.builder()
                .id(wishlist.getId())
                .productId(p.getId())
                .nameEn(p.getNameEn())
                .nameBn(p.getNameBn())
                .urlSlug(p.getUrlSlug())
                .mainPrice(p.getMainPrice())
                .discountPrice(p.getDiscountPrice())
                .primaryImageUrl(p.getMainImageUrl())
                .inStock(p.getStockQuantity() > 0)
                .addedAt(wishlist.getAddedAt())
                .build();
    }

    /**
     * Checks if a product is saved in a user's wishlist.
     *
     * @param userId unique UUID of the user
     * @param productId unique UUID of the product
     * @return true if the item exists in the wishlist, false otherwise
     */
    @Transactional(readOnly = true)
    public boolean isInWishlist(UUID userId, UUID productId) {
        return wishlistRepository.existsByUserIdAndProductId(userId, productId);
    }
}
