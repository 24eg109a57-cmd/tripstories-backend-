package com.tripstories.backend.service;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertThrows;

class CloudinaryStorageServiceTest {

    @Test
    void refusesImageUploadsWhenCloudinaryIsNotConfigured() {
        CloudinaryStorageService storageService =
                new CloudinaryStorageService("", "", "");
        MockMultipartFile file = new MockMultipartFile(
                "photos",
                "photo.jpg",
                "image/jpeg",
                new byte[] {1, 2, 3}
        );

        assertThrows(
                ResponseStatusException.class,
                () -> storageService.uploadImages(List.of(file))
        );
    }
}
