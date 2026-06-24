package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Brand;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Brand Repository
 *
 * Provides database access operations for the Brand entity.
 */
@Repository
public interface BrandRepository extends JpaRepository<Brand, UUID> {

    /**
     * Finds a brand by its unique URL slug.
     *
     * @param slug unique SEO slug
     * @return an Optional containing the brand if found
     */
    Optional<Brand> findBySlug(String slug);

    /**
     * Checks if a brand exists with the given URL slug.
     *
     * @param slug unique SEO slug
     * @return true if a brand exists with the slug, false otherwise
     */
    boolean existsBySlug(String slug);

    /**
     * Retrieves all active brands ordered by their English name alphabetically.
     *
     * @return list of active brands
     */
    List<Brand> findByActiveTrueOrderByNameEnAsc();

    /**
     * Retrieves active brands in a paginated format.
     *
     * @param pageable pagination parameters
     * @return page of active brands
     */
    Page<Brand> findByActiveTrue(Pageable pageable);
}
