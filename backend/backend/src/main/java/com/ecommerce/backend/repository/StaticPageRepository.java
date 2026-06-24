package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.StaticPage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for {@link StaticPage} entity.
 * Provides database operations and custom queries for managing static pages (e.g., About Us, Privacy Policy).
 */
@Repository
public interface StaticPageRepository extends JpaRepository<StaticPage, UUID> {

    /**
     * Finds a static page by its slug.
     *
     * @param slug the unique URL slug of the static page
     * @return an {@link Optional} containing the static page if found, or empty
     */
    Optional<StaticPage> findBySlug(String slug);

    /**
     * Checks if a static page exists with the given slug.
     *
     * @param slug the unique URL slug to check
     * @return true if a static page with the slug exists, false otherwise
     */
    boolean existsBySlug(String slug);
}
