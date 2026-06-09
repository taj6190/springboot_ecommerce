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

@Service
@RequiredArgsConstructor
public class HomepageSectionService {

    private final HomepageSectionRepository repository;

    @Cacheable(value = "homepage", key = "'sections'")
    @Transactional(readOnly = true)
    public List<HomepageSection> getActiveSections() {
        return repository.findByActiveTrueOrderByDisplayOrderAsc();
    }

    @Transactional(readOnly = true)
    public List<HomepageSection> getAll() {
        return repository.findAll();
    }

    @CacheEvict(value = "homepage", allEntries = true)
    @Transactional
    public HomepageSection create(HomepageSection section) {
        return repository.save(section);
    }

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

    @CacheEvict(value = "homepage", allEntries = true)
    @Transactional
    public void delete(UUID id) {
        if (!repository.existsById(id)) throw new ResourceNotFoundException("Section", "id", id);
        repository.deleteById(id);
    }

    @CacheEvict(value = "homepage", allEntries = true)
    @Transactional
    public void deleteSections(List<UUID> ids) {
        ids.forEach(this::delete);
    }
}
