package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Brand;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BrandRepository extends JpaRepository<Brand, UUID> {
    Optional<Brand> findBySlug(String slug);
    boolean existsBySlug(String slug);
    List<Brand> findByActiveTrueOrderByNameEnAsc();
    Page<Brand> findByActiveTrue(Pageable pageable);
}
