package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Slider;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.repository.SliderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Slider Service
 *
 * Handles the business logic for homepage promotional sliders and banners.
 * Supports active slider listing (cached), admin CRUD management, bulk deletion, and display order resequencing.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SliderService {

    /**
     * Repository interface for querying and modifying Slider records.
     */
    private final SliderRepository sliderRepository;

    /**
     * Retrieves all active sliders sorted by display order.
     * Caches query results to accelerate storefront render times.
     *
     * @return list of active Slider objects
     */
    @Cacheable(value = "homepage", key = "'sliders'")
    @Transactional(readOnly = true)
    public List<Slider> getActiveSliders() {
        return sliderRepository.findByActiveTrueOrderByDisplayOrderAsc();
    }

    /**
     * Retrieves all configured sliders (both active and inactive).
     *
     * @return list of all Slider objects
     */
    @Transactional(readOnly = true)
    public List<Slider> getAllSliders() {
        return sliderRepository.findAll();
    }

    /**
     * Creates a new slider entry.
     * Evicts cached homepage sliders to publish changes.
     *
     * @param slider configuration details of the slider
     * @return the saved Slider entity
     */
    @CacheEvict(value = "homepage", key = "'sliders'")
    @Transactional
    public Slider createSlider(Slider slider) {
        return sliderRepository.save(slider);
    }

    /**
     * Updates an existing slider configuration.
     * Evicts the homepage sliders cache.
     *
     * @param id unique UUID of the slider to update
     * @param updated updated configuration details
     * @return the updated Slider entity
     * @throws ResourceNotFoundException if the slider is not found
     */
    @CacheEvict(value = "homepage", key = "'sliders'")
    @Transactional
    public Slider updateSlider(UUID id, Slider updated) {
        Slider slider = sliderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Slider", "id", id));
        slider.setTitleEn(updated.getTitleEn());
        slider.setTitleBn(updated.getTitleBn());
        slider.setSubtitleEn(updated.getSubtitleEn());
        slider.setSubtitleBn(updated.getSubtitleBn());
        slider.setImageUrl(updated.getImageUrl());
        slider.setLinkUrl(updated.getLinkUrl());
        slider.setDisplayOrder(updated.getDisplayOrder());
        slider.setActive(updated.isActive());
        slider.setStartDate(updated.getStartDate());
        slider.setEndDate(updated.getEndDate());
        return sliderRepository.save(slider);
    }

    /**
     * Deletes a slider by its UUID.
     * Evicts the homepage sliders cache.
     *
     * @param id unique UUID of the slider to delete
     * @throws ResourceNotFoundException if the slider does not exist
     */
    @CacheEvict(value = "homepage", key = "'sliders'")
    @Transactional
    public void deleteSlider(UUID id) {
        if (!sliderRepository.existsById(id)) throw new ResourceNotFoundException("Slider", "id", id);
        sliderRepository.deleteById(id);
    }

    /**
     * Bulk deletes multiple sliders by their UUID list.
     * Evicts the homepage sliders cache.
     *
     * @param ids list of slider UUIDs to delete
     */
    @CacheEvict(value = "homepage", key = "'sliders'")
    @Transactional
    public void deleteSliders(List<UUID> ids) {
        ids.forEach(this::deleteSlider);
    }

    /**
     * Reorders the display sequence of sliders based on ordered list inputs.
     * Evicts the homepage sliders cache.
     *
     * @param orderedIds ordered list of slider UUIDs representing their updated order
     */
    @CacheEvict(value = "homepage", key = "'sliders'")
    @Transactional
    public void reorderSliders(List<UUID> orderedIds) {
        for (int i = 0; i < orderedIds.size(); i++) {
            Slider slider = sliderRepository.findById(orderedIds.get(i)).orElse(null);
            if (slider != null) {
                slider.setDisplayOrder(i);
                sliderRepository.save(slider);
            }
        }
    }
}
