package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.StaticPage;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.repository.StaticPageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Static Page Service
 *
 * Handles the business logic for static informational pages (About Us, Terms of Service, Privacy Policy).
 * Provides cached lookup by slug, CRUD management, and bulk page deletion.
 */
@Service
@RequiredArgsConstructor
public class StaticPageService {

    /**
     * Repository interface for querying and saving StaticPage records in the database.
     */
    private final StaticPageRepository staticPageRepository;

    /**
     * Retrieves a static page configuration by its unique URL slug.
     * Caches query results to accelerate page render speeds.
     *
     * @param slug the page SEO slug string
     * @return the StaticPage details
     * @throws ResourceNotFoundException if no matching page is found
     */
    @Cacheable(value = "homepage", key = "'page-' + #slug")
    @Transactional(readOnly = true)
    public StaticPage getBySlug(String slug) {
        return staticPageRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Page", "slug", slug));
    }

    /**
     * Retrieves all configured static pages.
     *
     * @return list of all StaticPage objects
     */
    @Transactional(readOnly = true)
    public List<StaticPage> getAll() {
        return staticPageRepository.findAll();
    }

    /**
     * Creates a new static page.
     * Evicts the homepage cache to invalidate outdated lists.
     *
     * @param page the page details to create
     * @return the saved StaticPage entity
     */
    @CacheEvict(value = "homepage", allEntries = true)
    @Transactional
    public StaticPage create(StaticPage page) {
        return staticPageRepository.save(page);
    }

    /**
     * Updates an existing static page's content, title, or type.
     * Evicts the homepage cache.
     *
     * @param id unique UUID of the page to update
     * @param updated updated configurations
     * @return the updated StaticPage entity
     * @throws ResourceNotFoundException if the page is not found
     */
    @CacheEvict(value = "homepage", allEntries = true)
    @Transactional
    public StaticPage update(UUID id, StaticPage updated) {
        StaticPage page = staticPageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Page", "id", id));
        page.setTitleEn(updated.getTitleEn());
        page.setTitleBn(updated.getTitleBn());
        page.setContentEn(updated.getContentEn());
        page.setContentBn(updated.getContentBn());
        page.setPageType(updated.getPageType());
        page.setPublished(updated.isPublished());
        return staticPageRepository.save(page);
    }

    /**
     * Deletes a static page from the database by its UUID.
     * Evicts the homepage cache.
     *
     * @param id unique UUID of the page to delete
     * @throws ResourceNotFoundException if the page does not exist
     */
    @CacheEvict(value = "homepage", allEntries = true)
    @Transactional
    public void delete(UUID id) {
        if (!staticPageRepository.existsById(id)) throw new ResourceNotFoundException("Page", "id", id);
        staticPageRepository.deleteById(id);
    }

    /**
     * Bulk deletes multiple static pages.
     * Evicts the homepage cache.
     *
     * @param ids list of page UUIDs to delete
     */
    @CacheEvict(value = "homepage", allEntries = true)
    @Transactional
    public void deletePages(List<UUID> ids) {
        ids.forEach(this::delete);
    }
}
