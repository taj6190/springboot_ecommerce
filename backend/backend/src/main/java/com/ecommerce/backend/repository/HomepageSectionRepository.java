package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.HomepageSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Homepage Section Repository
 *
 * Provides database access operations for the HomepageSection entity.
 */
@Repository
public interface HomepageSectionRepository extends JpaRepository<HomepageSection, UUID> {

    /**
     * Retrieves all active sections sorted by display order.
     *
     * @return list of active homepage sections
     */
    List<HomepageSection> findByActiveTrueOrderByDisplayOrderAsc();
}
