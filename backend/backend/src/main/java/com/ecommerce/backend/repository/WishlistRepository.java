package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Wishlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, UUID> {
    Page<Wishlist> findByUserIdOrderByAddedAtDesc(UUID userId, Pageable pageable);
    Optional<Wishlist> findByUserIdAndProductId(UUID userId, UUID productId);
    boolean existsByUserIdAndProductId(UUID userId, UUID productId);
    int countByProductId(UUID productId);
    void deleteByUserIdAndProductId(UUID userId, UUID productId);
}
