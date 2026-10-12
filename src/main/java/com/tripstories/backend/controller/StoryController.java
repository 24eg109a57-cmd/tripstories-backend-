package com.tripstories.backend.controller;

import com.tripstories.backend.model.Story;
import com.tripstories.backend.service.SocialService;
import com.tripstories.backend.service.CloudinaryStorageService;
import com.tripstories.backend.service.StoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.io.IOException;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/stories")
public class StoryController {

    private final StoryService storyService;
    private final SocialService socialService;
    private final CloudinaryStorageService cloudinaryStorageService;

    public StoryController(
            StoryService storyService,
            SocialService socialService,
            CloudinaryStorageService cloudinaryStorageService) {
        this.storyService = storyService;
        this.socialService = socialService;
        this.cloudinaryStorageService = cloudinaryStorageService;
    }

    @GetMapping
    public List<Story> getAllStories() {
        return storyService.getAllStories();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Story> getStory(@PathVariable Long id) {
        return storyService.getStoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{email}")
    public List<Story> getUserStories(
            @PathVariable String email) {

        return storyService.getStoriesByAuthor(email);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public Story createStory(
            @RequestBody Story story,
            @AuthenticationPrincipal Jwt jwt) {
        story.setAuthorEmail(jwt.getSubject());
        story.setAuthorName(jwt.getClaimAsString("name"));
        return storyService.createStory(story);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Story> createStoryWithPhotos(
            @RequestPart("story") Story story,
            @RequestPart(value = "photos", required = false)
                    List<MultipartFile> photos,
            @AuthenticationPrincipal Jwt jwt) {
        List<MultipartFile> files =
                photos == null ? List.of() : photos;
        if (files.size() > 6) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A story can contain no more than 6 photos."
            );
        }
        if (files.stream().anyMatch(file ->
                file.isEmpty() ||
                        file.getContentType() == null ||
                        !List.of(
                                "image/jpeg",
                                "image/png",
                                "image/webp",
                                "image/gif"
                        ).contains(file.getContentType()))) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Every uploaded file must be a non-empty image."
            );
        }
        if (story.getTitle() == null || story.getTitle().isBlank() ||
                story.getText() == null || story.getText().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A story title and story text are required."
            );
        }

        story.setAuthorEmail(jwt.getSubject());
        story.setAuthorName(jwt.getClaimAsString("name"));
        List<CloudinaryStorageService.UploadedPhoto> uploadedPhotos;
        try {
            uploadedPhotos = cloudinaryStorageService.uploadImages(files);
        } catch (IOException error) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "One or more story photos could not be uploaded.",
                    error
            );
        }
        try {
            return ResponseEntity.ok(
                    storyService.createStory(story, uploadedPhotos)
            );
        } catch (RuntimeException error) {
            try {
                cloudinaryStorageService.deleteImages(uploadedPhotos.stream()
                        .map(CloudinaryStorageService.UploadedPhoto::publicId)
                        .toList());
            } catch (RuntimeException cleanupError) {
                error.addSuppressed(cleanupError);
            }
            throw error;
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Story> updateStory(
            @PathVariable Long id,
            @RequestBody Story story,
            @AuthenticationPrincipal Jwt jwt) {

        return storyService.updateStory(id, story, jwt.getSubject())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStory(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {

        if (!storyService.deleteStory(id, jwt.getSubject())) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/like")
    public ResponseEntity<Story> likeStory(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {

        return socialService.toggleLike(id, jwt.getSubject())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}