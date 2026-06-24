package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Slider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository interface for {@link Slider} entity.
 * Provides database operations and custom queries for managing homepage sliders.
 */
@Repository
public interface SliderRepository extends JpaRepository<Slider, UUID> {
    
    /**
     * Retrieves all active sliders ordered by their display sequence.
     *
     * @return a list of active sliders ordered by display order ascending
     */
    List<Slider> findByActiveTrueOrderByDisplayOrderAsc();
}
