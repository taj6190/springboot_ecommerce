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

@Slf4j
@Service
@RequiredArgsConstructor
public class BrandService {

    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;

    @Cacheable(value = "brands", key = "'all'")
    @Transactional(readOnly = true)
    public List<BrandResponse> getAllActiveBrands() {
        return brandRepository.findByActiveTrueOrderByNameEnAsc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<BrandResponse> getAllBrands(Pageable pageable) {
        return brandRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public BrandResponse getBrandById(UUID id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand", "id", id));
        return mapToResponse(brand);
    }

    @Transactional(readOnly = true)
    public BrandResponse getBrandBySlug(String slug) {
        Brand brand = brandRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Brand", "slug", slug));
        return mapToResponse(brand);
    }

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

    @CacheEvict(value = "brands", allEntries = true)
    @Transactional
    public void deleteBrands(List<UUID> ids) {
        ids.forEach(this::deleteBrand);
    }

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
