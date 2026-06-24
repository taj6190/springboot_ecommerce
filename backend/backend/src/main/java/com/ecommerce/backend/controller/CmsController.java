package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.ApiResponse;
import com.ecommerce.backend.entity.HomepageSection;
import com.ecommerce.backend.entity.Slider;
import com.ecommerce.backend.entity.StaticPage;
import com.ecommerce.backend.service.HomepageSectionService;
import com.ecommerce.backend.service.SliderService;
import com.ecommerce.backend.service.StaticPageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * CMS (Content Management System) Controller
 *
 * Exposes endpoints for managing website content such as sliders, static pages, and homepage sections.
 * Provides public endpoints for content rendering on the frontend and admin/editor endpoints for CRUD operations.
 */
@RestController
@RequiredArgsConstructor
@Tag(name = "CMS", description = "Content Management")
public class CmsController {

    /**
     * Service handling the business logic for sliders/banners.
     */
    private final SliderService sliderService;

    /**
     * Service handling the business logic for static information pages.
     */
    private final StaticPageService staticPageService;

    /**
     * Service handling the business logic for homepage layout/sections.
     */
    private final HomepageSectionService homepageSectionService;

    // --- Public ---

    /**
     * Retrieves all active sliders to display on the storefront landing page.
     * This endpoint is public.
     *
     * @return a ResponseEntity containing the list of active sliders
     */
    @GetMapping("/public/sliders")
    @Operation(summary = "Get active sliders")
    public ResponseEntity<ApiResponse<List<Slider>>> getActiveSliders() {
        return ResponseEntity.ok(ApiResponse.success(sliderService.getActiveSliders()));
    }

    /**
     * Retrieves a static page's content by its unique slug.
     * Used for pages like About Us, Privacy Policy, Terms, etc.
     * This endpoint is public.
     *
     * @param slug the SEO-friendly URL slug of the static page
     * @return a ResponseEntity containing the static page details
     */
    @GetMapping("/public/pages/{slug}")
    @Operation(summary = "Get static page by slug")
    public ResponseEntity<ApiResponse<StaticPage>> getPage(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(staticPageService.getBySlug(slug)));
    }

    /**
     * Retrieves active content sections structured for the homepage layout.
     * This endpoint is public.
     *
     * @return a ResponseEntity containing the list of active homepage sections
     */
    @GetMapping("/public/homepage/sections")
    @Operation(summary = "Get active homepage sections")
    public ResponseEntity<ApiResponse<List<HomepageSection>>> getActiveSections() {
        return ResponseEntity.ok(ApiResponse.success(homepageSectionService.getActiveSections()));
    }

    // --- Admin Sliders ---

    /**
     * Retrieves all configured sliders (both active and inactive) for management.
     * Restricted to admin or content editor users.
     *
     * @return a ResponseEntity containing the list of all sliders
     */
    @GetMapping("/admin/sliders")
    @PreAuthorize("hasAnyRole('ADMIN','CONTENT_EDITOR')")
    public ResponseEntity<ApiResponse<List<Slider>>> getAllSliders() {
        return ResponseEntity.ok(ApiResponse.success(sliderService.getAllSliders()));
    }

    /**
     * Creates a new slider/banner entry.
     * Restricted to admin or content editor users.
     *
     * @param slider the slider data to create
     * @return a ResponseEntity containing the created slider details
     */
    @PostMapping("/admin/sliders")
    @PreAuthorize("hasAnyRole('ADMIN','CONTENT_EDITOR')")
    public ResponseEntity<ApiResponse<Slider>> createSlider(@RequestBody Slider slider) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Slider created", sliderService.createSlider(slider)));
    }

    /**
     * Updates an existing slider configuration.
     * Restricted to admin or content editor users.
     *
     * @param id the unique UUID of the slider to update
     * @param slider the updated slider configuration
     * @return a ResponseEntity containing the updated slider details
     */
    @PutMapping("/admin/sliders/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','CONTENT_EDITOR')")
    public ResponseEntity<ApiResponse<Slider>> updateSlider(@PathVariable UUID id, @RequestBody Slider slider) {
        return ResponseEntity.ok(ApiResponse.success("Slider updated", sliderService.updateSlider(id, slider)));
    }

    /**
     * Deletes a slider by its UUID.
     * Restricted strictly to users with the ADMIN role.
     *
     * @param id the unique UUID of the slider to delete
     * @return a ResponseEntity indicating successful deletion
     */
    @DeleteMapping("/admin/sliders/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSlider(@PathVariable UUID id) {
        sliderService.deleteSlider(id);
        return ResponseEntity.ok(ApiResponse.success("Slider deleted"));
    }

    /**
     * Deletes multiple sliders in a bulk action.
     * Restricted strictly to users with the ADMIN role.
     *
     * @param ids list of unique UUIDs of the sliders to delete
     * @return a ResponseEntity indicating successful deletion
     */
    @DeleteMapping("/admin/sliders/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bulk delete sliders")
    public ResponseEntity<ApiResponse<Void>> deleteSliders(@RequestBody List<UUID> ids) {
        sliderService.deleteSliders(ids);
        return ResponseEntity.ok(ApiResponse.success("Sliders deleted successfully"));
    }

    /**
     * Reorders the rendering sequences of sliders based on bulk drag-and-drop order input.
     * Restricted to admin or content editor users.
     *
     * @param orderedIds ordered list of unique UUIDs representing the new sequences
     * @return a ResponseEntity indicating successful reordering
     */
    @PostMapping("/admin/sliders/reorder")
    @PreAuthorize("hasAnyRole('ADMIN','CONTENT_EDITOR')")
    @Operation(summary = "Reorder sliders (drag-and-drop)")
    public ResponseEntity<ApiResponse<Void>> reorderSliders(@RequestBody List<UUID> orderedIds) {
        sliderService.reorderSliders(orderedIds);
        return ResponseEntity.ok(ApiResponse.success("Sliders reordered"));
    }

    // --- Admin Pages ---

    /**
     * Retrieves all static pages in the system.
     * Restricted to admin or content editor users.
     *
     * @return a ResponseEntity containing the list of all static pages
     */
    @GetMapping("/admin/pages")
    @PreAuthorize("hasAnyRole('ADMIN','CONTENT_EDITOR')")
    public ResponseEntity<ApiResponse<List<StaticPage>>> getAllPages() {
        return ResponseEntity.ok(ApiResponse.success(staticPageService.getAll()));
    }

    /**
     * Creates a new static page (e.g. FAQ, About page).
     * Restricted to admin or content editor users.
     *
     * @param page the static page details to create
     * @return a ResponseEntity containing the created static page
     */
    @PostMapping("/admin/pages")
    @PreAuthorize("hasAnyRole('ADMIN','CONTENT_EDITOR')")
    public ResponseEntity<ApiResponse<StaticPage>> createPage(@RequestBody StaticPage page) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Page created", staticPageService.create(page)));
    }

    /**
     * Updates an existing static page.
     * Restricted to admin or content editor users.
     *
     * @param id the unique UUID of the page to update
     * @param page the updated static page details
     * @return a ResponseEntity containing the updated static page
     */
    @PutMapping("/admin/pages/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','CONTENT_EDITOR')")
    public ResponseEntity<ApiResponse<StaticPage>> updatePage(@PathVariable UUID id, @RequestBody StaticPage page) {
        return ResponseEntity.ok(ApiResponse.success("Page updated", staticPageService.update(id, page)));
    }

    /**
     * Deletes a static page by its UUID.
     * Restricted strictly to users with the ADMIN role.
     *
     * @param id the unique UUID of the static page to delete
     * @return a ResponseEntity indicating successful deletion
     */
    @DeleteMapping("/admin/pages/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePage(@PathVariable UUID id) {
        staticPageService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Page deleted"));
    }

    /**
     * Deletes multiple static pages in a bulk action.
     * Restricted strictly to users with the ADMIN role.
     *
     * @param ids list of unique UUIDs of the pages to delete
     * @return a ResponseEntity indicating successful deletion
     */
    @DeleteMapping("/admin/pages/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bulk delete static pages")
    public ResponseEntity<ApiResponse<Void>> deletePages(@RequestBody List<UUID> ids) {
        staticPageService.deletePages(ids);
        return ResponseEntity.ok(ApiResponse.success("Pages deleted successfully"));
    }

    // --- Admin Homepage Sections ---

    /**
     * Retrieves all layout sections of the homepage.
     * Restricted to admin or content editor users.
     *
     * @return a ResponseEntity containing the list of all homepage sections
     */
    @GetMapping("/admin/homepage/sections")
    @PreAuthorize("hasAnyRole('ADMIN','CONTENT_EDITOR')")
    public ResponseEntity<ApiResponse<List<HomepageSection>>> getAllSections() {
        return ResponseEntity.ok(ApiResponse.success(homepageSectionService.getAll()));
    }

    /**
     * Creates a new homepage layout section (e.g., promotional block, featured items grid).
     * Restricted to admin or content editor users.
     *
     * @param section the section config to create
     * @return a ResponseEntity containing the created homepage section
     */
    @PostMapping("/admin/homepage/sections")
    @PreAuthorize("hasAnyRole('ADMIN','CONTENT_EDITOR')")
    public ResponseEntity<ApiResponse<HomepageSection>> createSection(@RequestBody HomepageSection section) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Section created", homepageSectionService.create(section)));
    }

    /**
     * Updates an existing homepage layout section.
     * Restricted to admin or content editor users.
     *
     * @param id the unique UUID of the section to update
     * @param section the updated homepage section configuration
     * @return a ResponseEntity containing the updated section details
     */
    @PutMapping("/admin/homepage/sections/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','CONTENT_EDITOR')")
    public ResponseEntity<ApiResponse<HomepageSection>> updateSection(@PathVariable UUID id, @RequestBody HomepageSection section) {
        return ResponseEntity.ok(ApiResponse.success("Section updated", homepageSectionService.update(id, section)));
    }

    /**
     * Deletes a homepage section by its UUID.
     * Restricted strictly to users with the ADMIN role.
     *
     * @param id the unique UUID of the section to delete
     * @return a ResponseEntity indicating successful deletion
     */
    @DeleteMapping("/admin/homepage/sections/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSection(@PathVariable UUID id) {
        homepageSectionService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Section deleted"));
    }

    /**
     * Deletes multiple homepage layout sections in a bulk action.
     * Restricted strictly to users with the ADMIN role.
     *
     * @param ids list of unique UUIDs of the sections to delete
     * @return a ResponseEntity indicating successful deletion
     */
    @DeleteMapping("/admin/homepage/sections/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bulk delete homepage sections")
    public ResponseEntity<ApiResponse<Void>> deleteSections(@RequestBody List<UUID> ids) {
        homepageSectionService.deleteSections(ids);
        return ResponseEntity.ok(ApiResponse.success("Sections deleted successfully"));
    }
}
