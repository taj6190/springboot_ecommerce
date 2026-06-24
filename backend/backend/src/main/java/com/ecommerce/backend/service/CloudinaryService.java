package com.ecommerce.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Cloudinary Service
 *
 * Provides a service layer for uploading, processing, and deleting media files (images, banners, logos) via Cloudinary CDN.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryService {

    /**
     * Interface to the Cloudinary API client.
     */
    private final Cloudinary cloudinary;

    /**
     * Upload a file to Cloudinary.
     *
     * @param file   the file to upload
     * @param folder the folder in Cloudinary (e.g., "products", "brands", "sliders")
     * @return the secure URL of the uploaded file
     */
    public String uploadFile(MultipartFile file, String folder) {
        try {
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", "ecommerce/" + folder,
                    "resource_type", "auto"
            ));
            return (String) result.get("secure_url");
        } catch (IOException e) {
            log.error("Failed to upload file to Cloudinary", e);
            throw new RuntimeException("Failed to upload file: " + e.getMessage());
        }
    }

    /**
     * Delete a file from Cloudinary by its public ID.
     */
    public void deleteFile(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            log.error("Failed to delete file from Cloudinary: {}", publicId, e);
        }
    }

    /**
     * Extract public ID from Cloudinary URL.
     */
    public String extractPublicId(String url) {
        if (url == null || url.isEmpty()) return null;
        // URL format: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{public_id}.{format}
        String[] parts = url.split("/upload/");
        if (parts.length < 2) return null;
        String path = parts[1];
        // Remove version prefix (v12345678/)
        if (path.matches("v\\d+/.*")) {
            path = path.substring(path.indexOf('/') + 1);
        }
        // Remove file extension
        int lastDot = path.lastIndexOf('.');
        if (lastDot > 0) {
            path = path.substring(0, lastDot);
        }
        return path;
    }
}
