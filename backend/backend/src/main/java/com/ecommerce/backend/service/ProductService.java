package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.brand.BrandRequest;
import com.ecommerce.backend.dto.brand.BrandResponse;
import com.ecommerce.backend.dto.product.*;
import com.ecommerce.backend.entity.*;
import com.ecommerce.backend.enums.ProductStatus;
import com.ecommerce.backend.exception.DuplicateResourceException;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.repository.*;
import com.ecommerce.backend.util.SlugUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Product Service
 *
 * Handles the business lifecycle of products, inventory stock levels, variants,
 * images, FAQs, and categories. Performs text-based searches and logs catalog audit changes.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    /**
     * Repository interface for querying and modifying Product entities.
     */
    private final ProductRepository productRepository;

    /**
     * Repository interface for querying and saving ProductVariant details.
     */
    private final ProductVariantRepository variantRepository;

    /**
     * Repository interface for ProductImage assets.
     */
    private final ProductImageRepository imageRepository;

    /**
     * Repository interface to link categories to products.
     */
    private final CategoryRepository categoryRepository;

    /**
     * Repository interface to link brands to products.
     */
    private final BrandRepository brandRepository;

    /**
     * Repository interface for product tag search and creation.
     */
    private final TagRepository tagRepository;

    /**
     * Repository interface to record auditing logs when products are modified.
     */
    private final ProductChangeHistoryRepository changeHistoryRepository;


    /**
     * Retrieves all products in the system matching status and search keywords.
     * Used mainly for admin panels.
     *
     * @param status optional filter by product status (e.g. PUBLISHED, DRAFT)
     * @param keyword optional search term matching name (En/Bn) or SKU
     * @param pageable pagination parameters
     * @return page of matching ProductResponse details
     */
    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllProducts(ProductStatus status, String keyword, Pageable pageable) {
        Specification<Product> spec = Specification.where(null);

        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }

        if (keyword != null && !keyword.isBlank()) {
            spec = spec.and((root, query, cb) -> {
                String pattern = "%" + keyword.toLowerCase() + "%";
                return cb.or(
                    cb.like(cb.lower(root.get("nameEn")), pattern),
                    cb.like(cb.lower(root.get("nameBn")), pattern),
                    cb.like(cb.lower(root.get("sku")), pattern)
                );
            });
        }

        return productRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    /**
     * Retrieves all published products matching public search filters.
     * Used mainly on customer catalog pages.
     *
     * @param categoryIds optional filter by list of category UUIDs
     * @param brandIds optional filter by list of brand UUIDs
     * @param minPrice optional filter by minimum price
     * @param maxPrice optional filter by maximum price
     * @param keyword search keyword matching name or SKU
     * @param pageable pagination parameters
     * @return page of matching ProductResponse details
     */
    @Transactional(readOnly = true)
    public Page<ProductResponse> getPublishedProducts(
            List<UUID> categoryIds, 
            List<UUID> brandIds, 
            Double minPrice, 
            Double maxPrice, 
            String keyword, 
            Pageable pageable) {
        
        Specification<Product> spec = Specification.where((root, query, cb) -> cb.equal(root.get("status"), ProductStatus.PUBLISHED));

        if (categoryIds != null && !categoryIds.isEmpty()) {
            spec = spec.and((root, query, cb) -> root.get("category").get("id").in(categoryIds));
        }

        if (brandIds != null && !brandIds.isEmpty()) {
            spec = spec.and((root, query, cb) -> root.get("brand").get("id").in(brandIds));
        }

        if (minPrice != null) {
            BigDecimal min = BigDecimal.valueOf(minPrice);
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("mainPrice"), min));
        }

        if (maxPrice != null) {
            BigDecimal max = BigDecimal.valueOf(maxPrice);
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("mainPrice"), max));
        }

        if (keyword != null && !keyword.isBlank()) {
            spec = spec.and((root, query, cb) -> {
                String pattern = "%" + keyword.toLowerCase() + "%";
                return cb.or(
                    cb.like(cb.lower(root.get("nameEn")), pattern),
                    cb.like(cb.lower(root.get("nameBn")), pattern),
                    cb.like(cb.lower(root.get("sku")), pattern)
                );
            });
        }

        return productRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    /**
     * Retrieves a detailed response DTO of a product by its UUID.
     *
     * @param id unique UUID of the product
     * @return ProductResponse details
     * @throws ResourceNotFoundException if the product is not found
     */
    @Transactional(readOnly = true)
    public ProductResponse getProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return mapToResponse(product);
    }

    /**
     * Retrieves a product by its SEO friendly slug.
     *
     * @param slug unique SEO slug of the product
     * @return ProductResponse details
     * @throws ResourceNotFoundException if no matching product is found
     */
    @Transactional(readOnly = true)
    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findByUrlSlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "slug", slug));
        return mapToResponse(product);
    }

    /**
     * Creates a new product catalog item, including variants, images, FAQs, and SEO-friendly slug.
     * Registers audit history. Evicts cache.
     *
     * @param request product configuration details
     * @return the created ProductResponse details
     * @throws DuplicateResourceException if the product SKU already exists
     */
    @CacheEvict(value = "products", allEntries = true)
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new DuplicateResourceException("Product", "sku", request.getSku());
        }

        String slug = request.getUrlSlug() != null && !request.getUrlSlug().isBlank()
                ? SlugUtil.toUniqueSlug(request.getUrlSlug(), productRepository::existsByUrlSlug)
                : SlugUtil.toUniqueSlug(request.getNameEn(), productRepository::existsByUrlSlug);

        Product product = Product.builder()
                .nameEn(request.getNameEn()).nameBn(request.getNameBn())
                .shortDescEn(request.getShortDescEn()).shortDescBn(request.getShortDescBn())
                .longDescEn(request.getLongDescEn()).longDescBn(request.getLongDescBn())
                .sku(request.getSku())
                .mainPrice(request.getMainPrice())
                .discountPrice(request.getDiscountPrice())
                .costPrice(request.getCostPrice())
                .stockQuantity(request.getStockQuantity())
                .lowStockThreshold(request.getLowStockThreshold() != null ? request.getLowStockThreshold() : 5)
                .productType(request.getProductType())
                .featured(request.getFeatured() != null && request.getFeatured())
                .trending(request.getTrending() != null && request.getTrending())
                .bestSeller(request.getBestSeller() != null && request.getBestSeller())
                .status(request.getStatus() != null ? request.getStatus() : ProductStatus.DRAFT)
                .seoTitle(request.getSeoTitle())
                .seoDescription(request.getSeoDescription())
                .urlSlug(slug)
                .metaKeywords(request.getMetaKeywords())
                .flashSaleActive(request.getFlashSaleActive() != null && request.getFlashSaleActive())
                .saleStartTime(request.getSaleStartTime())
                .saleEndTime(request.getSaleEndTime())
                .mainImageUrl(request.getMainImageUrl())
                .build();

        // Set category
        if (request.getCategoryId() != null) {
            Category cat = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            product.setCategory(cat);
        }

        // Set brand
        if (request.getBrandId() != null) {
            Brand brand = brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Brand", "id", request.getBrandId()));
            product.setBrand(brand);
        }

        // Set tags
        if (request.getTags() != null) {
            Set<Tag> tags = request.getTags().stream().map(tagName -> {
                return tagRepository.findByName(tagName).orElseGet(() -> {
                    Tag newTag = Tag.builder().name(tagName).slug(SlugUtil.toSlug(tagName)).build();
                    return tagRepository.save(newTag);
                });
            }).collect(Collectors.toSet());
            product.setTags(tags);
        }

        product = productRepository.save(product);

        // Add variants
        if (request.getVariants() != null) {
            for (ProductVariantRequest vr : request.getVariants()) {
                ProductVariant variant = ProductVariant.builder()
                        .product(product).sku(vr.getSku())
                        .size(vr.getSize()).color(vr.getColor())
                        .material(vr.getMaterial()).weight(vr.getWeight())
                        .price(vr.getPrice()).discountPrice(vr.getDiscountPrice())
                        .stockQuantity(vr.getStockQuantity())
                        .active(vr.getActive() != null ? vr.getActive() : true)
                        .imageUrl(vr.getImageUrl())
                        .build();
                product.addVariant(variant);
            }
        }

        // Add FAQs
        if (request.getFaqs() != null) {
            for (ProductFaqRequest fq : request.getFaqs()) {
                ProductFaq faq = ProductFaq.builder()
                        .product(product).question(fq.getQuestion())
                        .answer(fq.getAnswer())
                        .displayOrder(fq.getDisplayOrder() != null ? fq.getDisplayOrder() : 0)
                        .build();
                product.getFaqs().add(faq);
            }
        }

        // Add Images
        if (request.getImages() != null) {
            for (ProductImageRequest ir : request.getImages()) {
                ProductImage img = ProductImage.builder()
                        .product(product).imageUrl(ir.getImageUrl())
                        .altText(ir.getAltText()).displayOrder(ir.getDisplayOrder())
                        .isMain(ir.isMain()).build();
                product.addImage(img);
            }
        }

        product = productRepository.save(product);

        // Record change history
        saveChangeHistory(product.getId(), "CREATE", "Product created: " + product.getNameEn());

        log.info("Product created: {} (SKU: {})", product.getNameEn(), product.getSku());
        return mapToResponse(product);
    }

    /**
     * Updates an existing product's catalog configuration, including categories, brand, tags,
     * images, variants, FAQs, and specifications. Evicts cache.
     *
     * @param id unique UUID of the product to update
     * @param request the updated configurations
     * @return updated ProductResponse details
     * @throws ResourceNotFoundException if the product or linked categories/brands do not exist
     */
    @CacheEvict(value = "products", allEntries = true)
    @Transactional
    public ProductResponse updateProduct(UUID id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        product.setNameEn(request.getNameEn());
        if (request.getNameBn() != null) product.setNameBn(request.getNameBn());
        if (request.getShortDescEn() != null) product.setShortDescEn(request.getShortDescEn());
        if (request.getShortDescBn() != null) product.setShortDescBn(request.getShortDescBn());
        if (request.getLongDescEn() != null) product.setLongDescEn(request.getLongDescEn());
        if (request.getLongDescBn() != null) product.setLongDescBn(request.getLongDescBn());
        product.setMainPrice(request.getMainPrice());
        if (request.getDiscountPrice() != null) product.setDiscountPrice(request.getDiscountPrice());
        if (request.getCostPrice() != null) product.setCostPrice(request.getCostPrice());
        product.setStockQuantity(request.getStockQuantity());
        if (request.getLowStockThreshold() != null) product.setLowStockThreshold(request.getLowStockThreshold());
        if (request.getProductType() != null) product.setProductType(request.getProductType());
        if (request.getFeatured() != null) product.setFeatured(request.getFeatured());
        if (request.getTrending() != null) product.setTrending(request.getTrending());
        if (request.getBestSeller() != null) product.setBestSeller(request.getBestSeller());
        if (request.getStatus() != null) product.setStatus(request.getStatus());
        if (request.getSeoTitle() != null) product.setSeoTitle(request.getSeoTitle());
        if (request.getSeoDescription() != null) product.setSeoDescription(request.getSeoDescription());
        if (request.getMetaKeywords() != null) product.setMetaKeywords(request.getMetaKeywords());
        if (request.getFlashSaleActive() != null) product.setFlashSaleActive(request.getFlashSaleActive());
        if (request.getSaleStartTime() != null) product.setSaleStartTime(request.getSaleStartTime());
        if (request.getSaleEndTime() != null) product.setSaleEndTime(request.getSaleEndTime());
        if (request.getMainImageUrl() != null) product.setMainImageUrl(request.getMainImageUrl());

        if (request.getCategoryId() != null) {
            Category cat = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            product.setCategory(cat);
        }
        if (request.getBrandId() != null) {
            Brand brand = brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Brand", "id", request.getBrandId()));
            product.setBrand(brand);
        }

        if (request.getTags() != null) {
            Set<Tag> tags = request.getTags().stream().map(tagName ->
                    tagRepository.findByName(tagName).orElseGet(() -> {
                        Tag t = Tag.builder().name(tagName).slug(SlugUtil.toSlug(tagName)).build();
                        return tagRepository.save(t);
                    })
            ).collect(Collectors.toSet());
            product.setTags(tags);
        }

        // Update Images
        if (request.getImages() != null) {
            product.getImages().clear();
            for (ProductImageRequest ir : request.getImages()) {
                ProductImage img = ProductImage.builder()
                        .product(product).imageUrl(ir.getImageUrl())
                        .altText(ir.getAltText()).displayOrder(ir.getDisplayOrder())
                        .isMain(ir.isMain()).build();
                product.addImage(img);
            }
        }

        // Update Variants
        if (request.getVariants() != null) {
            product.getVariants().clear();
            for (ProductVariantRequest vr : request.getVariants()) {
                ProductVariant variant = ProductVariant.builder()
                        .product(product).sku(vr.getSku())
                        .size(vr.getSize()).color(vr.getColor())
                        .material(vr.getMaterial()).weight(vr.getWeight())
                        .price(vr.getPrice()).discountPrice(vr.getDiscountPrice())
                        .stockQuantity(vr.getStockQuantity())
                        .active(vr.getActive() != null ? vr.getActive() : true)
                        .imageUrl(vr.getImageUrl())
                        .build();
                product.addVariant(variant);
            }
        }

        // Update FAQs
        if (request.getFaqs() != null) {
            product.getFaqs().clear();
            for (ProductFaqRequest fq : request.getFaqs()) {
                ProductFaq faq = ProductFaq.builder()
                        .product(product).question(fq.getQuestion())
                        .answer(fq.getAnswer())
                        .displayOrder(fq.getDisplayOrder() != null ? fq.getDisplayOrder() : 0)
                        .build();
                product.getFaqs().add(faq);
            }
        }

        // Update Specifications
        if (request.getSpecifications() != null) {
            product.getSpecifications().clear();
            product.getSpecifications().addAll(request.getSpecifications().stream()
                .map(s -> ProductSpecification.builder().key(s.getKey()).value(s.getValue()).build())
                .collect(Collectors.toList()));
        }

        product = productRepository.save(product);
        saveChangeHistory(product.getId(), "UPDATE", "Product updated");
        log.info("Product updated: {}", product.getId());
        return mapToResponse(product);
    }

    /**
     * Updates the stock level of a product.
     * Supports ADD, SUBTRACT, and SET operations.
     *
     * @param id unique UUID of the product
     * @param quantity the adjustment quantity
     * @param operation the type of adjustment (ADD, SUBTRACT, SET)
     * @return updated ProductResponse details
     * @throws ResourceNotFoundException if the product is not found
     */
    @Transactional
    public ProductResponse updateStock(UUID id, Integer quantity, String operation) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        int newStock = product.getStockQuantity();
        if ("ADD".equalsIgnoreCase(operation)) {
            newStock += quantity;
        } else if ("SUBTRACT".equalsIgnoreCase(operation)) {
            newStock -= quantity;
        } else if ("SET".equalsIgnoreCase(operation)) {
            newStock = quantity;
        }

        if (newStock < 0) newStock = 0;
        product.setStockQuantity(newStock);
        product = productRepository.save(product);

        saveChangeHistory(id, "STOCK_UPDATE", "Stock updated (" + operation + " " + quantity + "). New stock: " + newStock);
        log.info("Stock updated for product {}: {} (Operation: {})", id, newStock, operation);
        
        return mapToResponse(product);
    }

    /**
     * Deletes a product from the database by its UUID.
     * If the product is linked to orders, it will be archived (soft-deleted) to protect integrity.
     * Cleans up unmapped relationships (wishlists, reviews, change logs) to avoid FK issues.
     * Evicts cache.
     *
     * @param id unique UUID of the product to delete
     * @throws ResourceNotFoundException if the product is not found
     */
    @CacheEvict(value = "products", allEntries = true)
    @Transactional
    public void deleteProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        long orderCount = productRepository.countOrderItemsByProductId(id);
        if (orderCount > 0) {
            log.warn("Cannot hard delete product {} (SKU: {}) because it is referenced in {} order(s). Archiving instead.", id, product.getSku(), orderCount);
            product.setStatus(ProductStatus.ARCHIVED);
            productRepository.save(product);
            saveChangeHistory(id, "ARCHIVE", "Product archived because it is referenced by orders");
            return;
        }

        // Safe to hard delete: clean up unmapped relationships manually to ensure no FK violations
        productRepository.deleteWishlistsByProductId(id);
        productRepository.deleteReviewsByProductId(id);
        productRepository.deleteHistoryByProductId(id);

        // Let JPA handle cascade deletion for mapped relationships (variants, images, faqs, tags, crossSells, upSells)

        productRepository.delete(product);
        log.info("Product hard deleted: {}", id);
    }

    /**
     * Bulk deletes multiple products.
     * Evicts cache.
     *
     * @param ids list of product UUIDs to delete
     */
    @CacheEvict(value = "products", allEntries = true)
    @Transactional
    public void deleteProducts(List<UUID> ids) {
        ids.forEach(this::deleteProduct);
    }

    /**
     * Performs a text search on products matching name or SKU.
     *
     * @param keyword search keyword
     * @param pageable pagination parameters
     * @return page of ProductResponse details
     */
    @Transactional(readOnly = true)
    public Page<ProductResponse> searchProducts(String keyword, Pageable pageable) {
        return productRepository.searchProducts(keyword, pageable).map(this::mapToResponse);
    }

    /**
     * Retrieves a page of active products belonging to a category.
     *
     * @param categoryId unique category UUID
     * @param pageable pagination parameters
     * @return page of ProductResponse details
     */
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsByCategory(UUID categoryId, Pageable pageable) {
        return productRepository.findByCategoryIdAndStatus(categoryId, ProductStatus.PUBLISHED, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Retrieves a page of active products belonging to a brand.
     *
     * @param brandId unique brand UUID
     * @param pageable pagination parameters
     * @return page of ProductResponse details
     */
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsByBrand(UUID brandId, Pageable pageable) {
        return productRepository.findByBrandIdAndStatus(brandId, ProductStatus.PUBLISHED, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Retrieves a list of active products marked as featured.
     *
     * @return list of ProductResponse details
     */
    @Transactional(readOnly = true)
    public List<ProductResponse> getFeaturedProducts() {
        return productRepository.findByFeaturedTrueAndStatusOrderByCreatedAtDesc(ProductStatus.PUBLISHED)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    /**
     * Retrieves a list of active products marked as trending.
     *
     * @return list of ProductResponse details
     */
    @Transactional(readOnly = true)
    public List<ProductResponse> getTrendingProducts() {
        return productRepository.findByTrendingTrueAndStatusOrderByCreatedAtDesc(ProductStatus.PUBLISHED)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    /**
     * Retrieves a list of active products that currently participate in a flash sale.
     *
     * @return list of ProductResponse details
     */
    @Transactional(readOnly = true)
    public List<ProductResponse> getFlashSaleProducts() {
        return productRepository.findActiveFlashSaleProducts()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    /**
     * Retrieves a list of products whose stock is at or below the low stock threshold.
     *
     * @return list of ProductResponse details
     */
    @Transactional(readOnly = true)
    public List<ProductResponse> getLowStockProducts() {
        return productRepository.findLowStockProducts()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    /**
     * Helper method to write product configuration change audit logs.
     *
     * @param productId unique UUID of the product
     * @param type change type code
     * @param details detailed audit note
     */
    private void saveChangeHistory(UUID productId, String type, String details) {
        changeHistoryRepository.save(ProductChangeHistory.builder()
                .productId(productId).changeType(type)
                .changeDetails(details).changedAt(Instant.now())
                .changedBy("SYSTEM") // Will be replaced by auditor
                .build());
    }

    /**
     * Maps a Product database entity to a ProductResponse DTO, containing variants, FAQs, and specifications.
     *
     * @param p the database entity
     * @return the mapped ProductResponse
     */
    private ProductResponse mapToResponse(Product p) {
        return ProductResponse.builder()
                .id(p.getId()).nameEn(p.getNameEn()).nameBn(p.getNameBn())
                .shortDescEn(p.getShortDescEn()).shortDescBn(p.getShortDescBn())
                .longDescEn(p.getLongDescEn()).longDescBn(p.getLongDescBn())
                .sku(p.getSku()).mainPrice(p.getMainPrice())
                .discountPrice(p.getDiscountPrice()).costPrice(p.getCostPrice())
                .stockQuantity(p.getStockQuantity()).lowStockThreshold(p.getLowStockThreshold())
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .categoryName(p.getCategory() != null ? p.getCategory().getNameEn() : null)
                .brandId(p.getBrand() != null ? p.getBrand().getId() : null)
                .brandName(p.getBrand() != null ? p.getBrand().getNameEn() : null)
                .productType(p.getProductType())
                .featured(p.isFeatured()).trending(p.isTrending()).bestSeller(p.isBestSeller())
                .status(p.getStatus())
                .seoTitle(p.getSeoTitle()).seoDescription(p.getSeoDescription())
                .urlSlug(p.getUrlSlug()).metaKeywords(p.getMetaKeywords())
                .flashSaleActive(p.isFlashSaleActive())
                .saleStartTime(p.getSaleStartTime()).saleEndTime(p.getSaleEndTime())
                .avgRating(p.getAvgRating()).reviewCount(p.getReviewCount())
                .wishlistCount(p.getWishlistCount())
                .mainImageUrl(p.getMainImageUrl())
                .images(p.getImages() != null ? p.getImages().stream().map(i ->
                        ProductImageResponse.builder().id(i.getId()).imageUrl(i.getImageUrl())
                                .altText(i.getAltText()).displayOrder(i.getDisplayOrder())
                                .isMain(i.isMain()).build()).collect(Collectors.toList()) : List.of())
                .variants(p.getVariants() != null ? p.getVariants().stream().map(v ->
                        ProductVariantResponse.builder().id(v.getId()).sku(v.getSku())
                                .size(v.getSize()).color(v.getColor()).material(v.getMaterial())
                                .weight(v.getWeight()).price(v.getPrice())
                                .discountPrice(v.getDiscountPrice())
                                .stockQuantity(v.getStockQuantity()).active(v.isActive())
                                .imageUrl(v.getImageUrl())
                                .build()).collect(Collectors.toList()) : List.of())
                .tags(p.getTags() != null ? p.getTags().stream().map(Tag::getName)
                        .collect(Collectors.toSet()) : Set.of())
                .faqs(p.getFaqs() != null ? p.getFaqs().stream().map(f ->
                        ProductFaqResponse.builder().id(f.getId()).question(f.getQuestion())
                                .answer(f.getAnswer()).displayOrder(f.getDisplayOrder())
                                .build()).collect(Collectors.toList()) : List.of())
                .specifications(p.getSpecifications() != null ? p.getSpecifications().stream()
                        .map(s -> ProductSpecification.builder().key(s.getKey()).value(s.getValue()).build())
                        .collect(Collectors.toList()) : List.of())
                .createdBy(p.getCreatedBy()).updatedBy(p.getUpdatedBy())
                .createdAt(p.getCreatedAt()).updatedAt(p.getUpdatedAt())
                .version(p.getVersion())
                .build();
    }
}
