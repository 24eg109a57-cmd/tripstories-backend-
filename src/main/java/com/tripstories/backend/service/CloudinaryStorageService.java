package com.tripstories.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class CloudinaryStorageService {

    private final String cloudName;
    private final String apiKey;
    private final String apiSecret;

    public CloudinaryStorageService(
            @Value("${cloudinary.cloud-name:}") String cloudName,
            @Value("${cloudinary.api-key:}") String apiKey,
            @Value("${cloudinary.api-secret:}") String apiSecret) {
        this.cloudName = cloudName;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }

    public List<UploadedPhoto> uploadImages(List<MultipartFile> files)
            throws IOException {
        if (files == null || files.isEmpty()) {
            return List.of();
        }

        Cloudinary cloudinary = configuredClient();
        List<UploadedPhoto> uploaded = new ArrayList<>();
        try {
            for (MultipartFile file : files) {
                Map<?, ?> result = cloudinary.uploader().upload(
                        file.getBytes(),
                        ObjectUtils.asMap(
                                "folder", "tripstories/stories",
                                "resource_type", "image",
                                "unique_filename", true,
                                "overwrite", false
                        )
                );
                Object secureUrl = result.get("secure_url");
                Object publicId = result.get("public_id");
                if (!(secureUrl instanceof String url) ||
                        !(publicId instanceof String id)) {
                    throw new IllegalStateException(
                            "Cloudinary returned an incomplete upload response."
                    );
                }
                uploaded.add(new UploadedPhoto(url, id));
            }
        } catch (IOException | RuntimeException error) {
            try {
                deleteImages(uploaded.stream()
                        .map(UploadedPhoto::publicId)
                        .toList());
            } catch (RuntimeException cleanupError) {
                error.addSuppressed(cleanupError);
            }
            throw error;
        }

        return List.copyOf(uploaded);
    }

    public void deleteImages(List<String> publicIds) {
        if (publicIds == null || publicIds.isEmpty()) {
            return;
        }

        Cloudinary cloudinary = configuredClient();
        for (String publicId : publicIds) {
            Map<?, ?> result;
            try {
                result = cloudinary.uploader().destroy(
                        publicId,
                        ObjectUtils.asMap("resource_type", "image")
                );
            } catch (Exception error) {
                throw new IllegalStateException(
                        "Cloudinary could not delete a story image.",
                        error
                );
            }

            Object status = result.get("result");
            if (!"ok".equals(status) && !"not found".equals(status)) {
                throw new IllegalStateException(
                        "Cloudinary did not confirm story image deletion."
                );
            }
        }
    }

    private Cloudinary configuredClient() {
        if (cloudName.isBlank() || apiKey.isBlank() || apiSecret.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Persistent image storage is not configured."
            );
        }
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
        ));
    }

    public record UploadedPhoto(String url, String publicId) {
    }
}
