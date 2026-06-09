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

@Slf4j
@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

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

    @Transactional(readOnly = true)
    public Page<WishlistResponse> getUserWishlist(UUID userId, Pageable pageable) {
        return wishlistRepository.findByUserIdOrderByAddedAtDesc(userId, pageable)
                .map(this::mapToResponse);
    }

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

    @Transactional(readOnly = true)
    public boolean isInWishlist(UUID userId, UUID productId) {
        return wishlistRepository.existsByUserIdAndProductId(userId, productId);
    }
}
