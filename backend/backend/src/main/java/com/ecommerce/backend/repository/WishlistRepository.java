package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Wishlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for {@link Wishlist} entity.
 * Provides database operations and custom queries for managing customer product wishlists.
 */
@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, UUID> {

    /**
     * Retrieves a paginated list of wishlist items for a specific user, sorted by the date added (newest first).
     *
     * @param userId   the ID of the user whose wishlist is being retrieved
     * @param pageable pagination and sorting information
     * @return a page of wishlist items
     */
    Page<Wishlist> findByUserIdOrderByAddedAtDesc(UUID userId, Pageable pageable);

    /**
     * Finds a wishlist item for a specific user and product combination.
     *
     * @param userId    the ID of the user
     * @param productId the ID of the product
     * @return an {@link Optional} containing the wishlist item if found, or empty
     */
    Optional<Wishlist> findByUserIdAndProductId(UUID userId, UUID productId);

    /**
     * Checks if a product exists in a user's wishlist.
     *
     * @param userId    the ID of the user
     * @param productId the ID of the product to check
     * @return true if the product is in the user's wishlist, false otherwise
     */
    boolean existsByUserIdAndProductId(UUID userId, UUID productId);

    /**
     * Counts how many users have added a specific product to their wishlist.
     *
     * @param productId the ID of the product
     * @return the number of times the product has been wishlisted
     */
    int countByProductId(UUID productId);

    /**
     * Deletes a wishlist item for a specific user and product combination.
     *
     * @param userId    the ID of the user
     * @param productId the ID of the product to remove
     */
    void deleteByUserIdAndProductId(UUID userId, UUID productId);
}
