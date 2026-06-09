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

@Service
@RequiredArgsConstructor
public class StaticPageService {

    private final StaticPageRepository staticPageRepository;

    @Cacheable(value = "homepage", key = "'page-' + #slug")
    @Transactional(readOnly = true)
    public StaticPage getBySlug(String slug) {
        return staticPageRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Page", "slug", slug));
    }

    @Transactional(readOnly = true)
    public List<StaticPage> getAll() {
        return staticPageRepository.findAll();
    }

    @CacheEvict(value = "homepage", allEntries = true)
    @Transactional
    public StaticPage create(StaticPage page) {
        return staticPageRepository.save(page);
    }

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

    @CacheEvict(value = "homepage", allEntries = true)
    @Transactional
    public void delete(UUID id) {
        if (!staticPageRepository.existsById(id)) throw new ResourceNotFoundException("Page", "id", id);
        staticPageRepository.deleteById(id);
    }

    @CacheEvict(value = "homepage", allEntries = true)
    @Transactional
    public void deletePages(List<UUID> ids) {
        ids.forEach(this::delete);
    }
}
