package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.HomepageSection;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.repository.HomepageSectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Homepage Section Service
 *
 * Handles the business logic for homepage layout components.
 * Manages cache evictions, layout sequences, and rendering configurations (e.g. grids, carousels).
 */
@Service
@RequiredArgsConstructor
public class HomepageSectionService {

    /**
     * Repository interface for querying and saving homepage sections in the database.
     */
    private final HomepageSectionRepository repository;

    /**
     * Retrieves all active sections sorted by their display order.
     * Results are cached to avoid database queries during homepage loads.
     *
     * @return list of active HomepageSection objects
     */
    @Cacheable(value = "homepage", key = "'sections'")
    @Transactional(readOnly = true)
    public List<HomepageSection> getActiveSections() {
        return repository.findByActiveTrueOrderByDisplayOrderAsc();
    }

    /**
     * Retrieves all configured homepage sections (active and inactive).
     *
     * @return list of all HomepageSection objects
     */
    @Transactional(readOnly = true)
    public List<HomepageSection> getAll() {
        return repository.findAll();
    }

    /**
     * Creates a new homepage layout section.
     * Evicts the homepage cache to reflect the new layout.
     *
     * @param section the section config details
     * @return the saved HomepageSection
     */
    @CacheEvict(value = "homepage", allEntries = true)
    @Transactional
    public HomepageSection create(HomepageSection section) {
        return repository.save(section);
    }

    /**
     * Updates an existing homepage section configuration.
     * Evicts the homepage cache.
     *
     * @param id unique UUID of the section to update
     * @param updated updated configuration details
     * @return the updated HomepageSection
     * @throws ResourceNotFoundException if the section does not exist
     */
    @CacheEvict(value = "homepage", allEntries = true)
    @Transactional
    public HomepageSection update(UUID id, HomepageSection updated) {
        HomepageSection section = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Section", "id", id));
        section.setSectionType(updated.getSectionType());
        section.setTitleEn(updated.getTitleEn());
        section.setTitleBn(updated.getTitleBn());
        section.setDisplayOrder(updated.getDisplayOrder());
        section.setConfig(updated.getConfig());
        section.setActive(updated.isActive());
        return repository.save(section);
    }

    /**
     * Deletes a homepage section from the database.
     * Evicts the homepage cache.
     *
     * @param id unique UUID of the section to delete
     * @throws ResourceNotFoundException if the section does not exist
     */
    @CacheEvict(value = "homepage", allEntries = true)
    @Transactional
    public void delete(UUID id) {
        if (!repository.existsById(id)) throw new ResourceNotFoundException("Section", "id", id);
        repository.deleteById(id);
    }

    /**
     * Bulk deletes multiple homepage sections.
     * Evicts the homepage cache.
     *
     * @param ids list of section UUIDs to delete
     */
    @CacheEvict(value = "homepage", allEntries = true)
    @Transactional
    public void deleteSections(List<UUID> ids) {
        ids.forEach(this::delete);
    }
}
