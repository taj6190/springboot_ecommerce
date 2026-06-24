package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for {@link Tag} entity.
 * Provides database operations and custom queries for managing product tags.
 */
@Repository
public interface TagRepository extends JpaRepository<Tag, UUID> {

    /**
     * Finds a tag by its name.
     *
     * @param name the name of the tag
     * @return an {@link Optional} containing the tag if found, or empty
     */
    Optional<Tag> findByName(String name);

    /**
     * Finds a tag by its URL slug.
     *
     * @param slug the unique URL slug of the tag
     * @return an {@link Optional} containing the tag if found, or empty
     */
    Optional<Tag> findBySlug(String slug);

    /**
     * Checks if a tag exists with the given name.
     *
     * @param name the name of the tag
     * @return true if a tag with the name exists, false otherwise
     */
    boolean existsByName(String name);
}
