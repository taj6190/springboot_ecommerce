package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.ApiResponse;
import com.ecommerce.backend.service.CloudinaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/admin/upload")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','PRODUCT_MANAGER','CONTENT_EDITOR')")
@Tag(name = "Upload", description = "File upload management")
public class UploadController {

    private final CloudinaryService cloudinaryService;

    @PostMapping
    @Operation(summary = "Upload a file to Cloudinary")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "general") String folder) {
        String url = cloudinaryService.uploadFile(file, folder);
        return ResponseEntity.ok(ApiResponse.success(Map.of("url", url)));
    }

    @DeleteMapping
    @Operation(summary = "Delete a file from Cloudinary")
    public ResponseEntity<ApiResponse<Void>> deleteFile(@RequestParam String url) {
        String publicId = cloudinaryService.extractPublicId(url);
        if (publicId != null) {
            cloudinaryService.deleteFile(publicId);
        }
        return ResponseEntity.ok(ApiResponse.success("File deleted"));
    }
}
