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

@RestController
@RequiredArgsConstructor
@Tag(name = "CMS", description = "Content Management")
public class CmsController {

    private final SliderService sliderService;
    private final StaticPageService staticPageService;
    private final HomepageSectionService homepageSectionService;

    // --- Public ---

    @GetMapping("/public/sliders")
    @Operation(summary = "Get active sliders")
    public ResponseEntity<ApiResponse<List<Slider>>> getActiveSliders() {
        return ResponseEntity.ok(ApiResponse.success(sliderService.getActiveSliders()));
    }

    @GetMapping("/public/pages/{slug}")
    @Operation(summary = "Get static page by slug")
    public ResponseEntity<ApiResponse<StaticPage>> getPage(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(staticPageService.getBySlug(slug)));
    }

    @GetMapping("/public/homepage/sections")
    @Operation(summary = "Get active homepage sections")
    public ResponseEntity<ApiResponse<List<HomepageSection>>> getActiveSections() {
        return ResponseEntity.ok(ApiResponse.success(homepageSectionService.getActiveSections()));
    }

    // --- Admin Sliders ---

    @GetMapping("/admin/sliders")
    @PreAuthorize("hasAnyRole('ADMIN','CONTENT_EDITOR')")
    public ResponseEntity<ApiResponse<List<Slider>>> getAllSliders() {
        return ResponseEntity.ok(ApiResponse.success(sliderService.getAllSliders()));
    }

    @PostMapping("/admin/sliders")
    @PreAuthorize("hasAnyRole('ADMIN','CONTENT_EDITOR')")
    public ResponseEntity<ApiResponse<Slider>> createSlider(@RequestBody Slider slider) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Slider created", sliderService.createSlider(slider)));
    }

    @PutMapping("/admin/sliders/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','CONTENT_EDITOR')")
    public ResponseEntity<ApiResponse<Slider>> updateSlider(@PathVariable UUID id, @RequestBody Slider slider) {
        return ResponseEntity.ok(ApiResponse.success("Slider updated", sliderService.updateSlider(id, slider)));
    }

    @DeleteMapping("/admin/sliders/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSlider(@PathVariable UUID id) {
        sliderService.deleteSlider(id);
        return ResponseEntity.ok(ApiResponse.success("Slider deleted"));
    }

    @DeleteMapping("/admin/sliders/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bulk delete sliders")
    public ResponseEntity<ApiResponse<Void>> deleteSliders(@RequestBody List<UUID> ids) {
        sliderService.deleteSliders(ids);
        return ResponseEntity.ok(ApiResponse.success("Sliders deleted successfully"));
    }

    @PostMapping("/admin/sliders/reorder")
    @PreAuthorize("hasAnyRole('ADMIN','CONTENT_EDITOR')")
    @Operation(summary = "Reorder sliders (drag-and-drop)")
    public ResponseEntity<ApiResponse<Void>> reorderSliders(@RequestBody List<UUID> orderedIds) {
        sliderService.reorderSliders(orderedIds);
        return ResponseEntity.ok(ApiResponse.success("Sliders reordered"));
    }

    // --- Admin Pages ---

    @GetMapping("/admin/pages")
    @PreAuthorize("hasAnyRole('ADMIN','CONTENT_EDITOR')")
    public ResponseEntity<ApiResponse<List<StaticPage>>> getAllPages() {
        return ResponseEntity.ok(ApiResponse.success(staticPageService.getAll()));
    }

    @PostMapping("/admin/pages")
    @PreAuthorize("hasAnyRole('ADMIN','CONTENT_EDITOR')")
    public ResponseEntity<ApiResponse<StaticPage>> createPage(@RequestBody StaticPage page) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Page created", staticPageService.create(page)));
    }

    @PutMapping("/admin/pages/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','CONTENT_EDITOR')")
    public ResponseEntity<ApiResponse<StaticPage>> updatePage(@PathVariable UUID id, @RequestBody StaticPage page) {
        return ResponseEntity.ok(ApiResponse.success("Page updated", staticPageService.update(id, page)));
    }

    @DeleteMapping("/admin/pages/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePage(@PathVariable UUID id) {
        staticPageService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Page deleted"));
    }

    @DeleteMapping("/admin/pages/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bulk delete static pages")
    public ResponseEntity<ApiResponse<Void>> deletePages(@RequestBody List<UUID> ids) {
        staticPageService.deletePages(ids);
        return ResponseEntity.ok(ApiResponse.success("Pages deleted successfully"));
    }

    // --- Admin Homepage Sections ---

    @GetMapping("/admin/homepage/sections")
    @PreAuthorize("hasAnyRole('ADMIN','CONTENT_EDITOR')")
    public ResponseEntity<ApiResponse<List<HomepageSection>>> getAllSections() {
        return ResponseEntity.ok(ApiResponse.success(homepageSectionService.getAll()));
    }

    @PostMapping("/admin/homepage/sections")
    @PreAuthorize("hasAnyRole('ADMIN','CONTENT_EDITOR')")
    public ResponseEntity<ApiResponse<HomepageSection>> createSection(@RequestBody HomepageSection section) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Section created", homepageSectionService.create(section)));
    }

    @PutMapping("/admin/homepage/sections/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','CONTENT_EDITOR')")
    public ResponseEntity<ApiResponse<HomepageSection>> updateSection(@PathVariable UUID id, @RequestBody HomepageSection section) {
        return ResponseEntity.ok(ApiResponse.success("Section updated", homepageSectionService.update(id, section)));
    }

    @DeleteMapping("/admin/homepage/sections/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSection(@PathVariable UUID id) {
        homepageSectionService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Section deleted"));
    }

    @DeleteMapping("/admin/homepage/sections/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bulk delete homepage sections")
    public ResponseEntity<ApiResponse<Void>> deleteSections(@RequestBody List<UUID> ids) {
        homepageSectionService.deleteSections(ids);
        return ResponseEntity.ok(ApiResponse.success("Sections deleted successfully"));
    }
}
