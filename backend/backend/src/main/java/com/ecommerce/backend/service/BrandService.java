package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.brand.BrandRequest;
import com.ecommerce.backend.dto.brand.BrandResponse;
import com.ecommerce.backend.entity.Brand;
import com.ecommerce.backend.exception.BadRequestException;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.repository.BrandRepository;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.util.SlugUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Brand Service
 *
 * Handles CRUD operations, search filters, and SEO friendly slug generation for product brands.
 * Manages cache entries for brand queries to optimize catalog presentation performance.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BrandService {

    /**
     * Repository interface for querying and modifying Brand entities in the database.
     */
    private final BrandRepository brandRepository;

    /**
     * Repository interface for checking product associations before deleting a brand.
     */
    private final ProductRepository productRepository;

    /**
     * Retrieves all active brands sorted alphabetically.
     * Caches results to avoid frequent database reads.
     *
     * @return list of active BrandResponse objects
     */
    @Cacheable(value = "brands", key = "'all'")
    @Transactional(readOnly = true)
    public List<BrandResponse> getAllActiveBrands() {
        return brandRepository.findByActiveTrueOrderByNameEnAsc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves all brands (active or inactive) in a pageable format.
     *
     * @param pageable pagination and sorting parameters
     * @return page of BrandResponse objects
     */
    @Transactional(readOnly = true)
    public Page<BrandResponse> getAllBrands(Pageable pageable) {
        return brandRepository.findAll(pageable).map(this::mapToResponse);
    }

    /**
     * Retrieves a brand's details by its unique UUID.
     *
     * @param id the brand UUID
     * @return BrandResponse details
     * @throws ResourceNotFoundException if the brand does not exist
     */
    @Transactional(readOnly = true)
    public BrandResponse getBrandById(UUID id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand", "id", id));
        return mapToResponse(brand);
    }

    /**
     * Retrieves a brand's details by its SEO slug.
     *
     * @param slug unique SEO slug of the brand
     * @return BrandResponse details
     * @throws ResourceNotFoundException if no matching brand is found
     */
    @Transactional(readOnly = true)
    public BrandResponse getBrandBySlug(String slug) {
        Brand brand = brandRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Brand", "slug", slug));
        return mapToResponse(brand);
    }

    /**
     * Creates a new brand, auto-generating a unique URL slug based on the English name.
     * Evicts the brands cache to ensure freshness.
     *
     * @param request payload containing brand configurations
     * @return the created BrandResponse details
     */
    @CacheEvict(value = "brands", allEntries = true)
    @Transactional
    public BrandResponse createBrand(BrandRequest request) {
        String slug = SlugUtil.toUniqueSlug(request.getNameEn(), brandRepository::existsBySlug);

        Brand brand = Brand.builder()
                .nameEn(request.getNameEn())
                .nameBn(request.getNameBn())
                .slug(slug)
                .logoUrl(request.getLogoUrl())
                .description(request.getDescription())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        brand = brandRepository.save(brand);
        log.info("Brand created: {} (slug: {})", brand.getNameEn(), brand.getSlug());
        return mapToResponse(brand);
    }

    /**
     * Updates an existing brand record, updating the URL slug if the English name is altered.
     * Evicts the brands cache to keep catalog listings up-to-date.
     *
     * @param id the UUID of the brand to update
     * @param request the updated configurations
     * @return updated BrandResponse details
     * @throws ResourceNotFoundException if the brand does not exist
     */
    @CacheEvict(value = "brands", allEntries = true)
    @Transactional
    public BrandResponse updateBrand(UUID id, BrandRequest request) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand", "id", id));

        brand.setNameEn(request.getNameEn());
        if (request.getNameBn() != null) brand.setNameBn(request.getNameBn());
        if (request.getLogoUrl() != null) brand.setLogoUrl(request.getLogoUrl());
        if (request.getDescription() != null) brand.setDescription(request.getDescription());
        if (request.getActive() != null) brand.setActive(request.getActive());

        String newSlug = SlugUtil.toSlug(request.getNameEn());
        if (!newSlug.equals(brand.getSlug())) {
            brand.setSlug(SlugUtil.toUniqueSlug(request.getNameEn(), brandRepository::existsBySlug));
        }

        brand = brandRepository.save(brand);
        log.info("Brand updated: {}", brand.getId());
        return mapToResponse(brand);
    }

    /**
     * Deletes a brand from the database.
     * Prevents deletion if products are currently associated with the brand to maintain integrity.
     *
     * @param id UUID of the brand to delete
     * @throws ResourceNotFoundException if the brand does not exist
     * @throws BadRequestException if products are associated with the brand
     */
    @CacheEvict(value = "brands", allEntries = true)
    @Transactional
    public void deleteBrand(UUID id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand", "id", id));

        // Check for products
        long productCount = productRepository.countByBrandId(id);
        if (productCount > 0) {
            throw new BadRequestException("Cannot delete brand because it is associated with " + productCount + " products. Please move or delete products first.");
        }

        brandRepository.delete(brand);
        log.info("Brand deleted: {}", id);
    }

    /**
     * Bulk deletes multiple brands by iterating and performing integrity checks on each.
     * Evicts the brands cache.
     *
     * @param ids list of brand UUIDs to delete
     */
    @CacheEvict(value = "brands", allEntries = true)
    @Transactional
    public void deleteBrands(List<UUID> ids) {
        ids.forEach(this::deleteBrand);
    }

    /**
     * Maps a Brand database entity to a BrandResponse DTO.
     *
     * @param brand the database entity
     * @return the mapped response object
     */
    private BrandResponse mapToResponse(Brand brand) {
        return BrandResponse.builder()
                .id(brand.getId())
                .nameEn(brand.getNameEn())
                .nameBn(brand.getNameBn())
                .slug(brand.getSlug())
                .logoUrl(brand.getLogoUrl())
                .description(brand.getDescription())
                .active(brand.isActive())
                .build();
    }
}
