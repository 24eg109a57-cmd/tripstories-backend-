package com.tripstories.backend.service;

import com.tripstories.backend.model.Story;
import com.tripstories.backend.model.StoryPhotoAsset;
import com.tripstories.backend.repository.StoryPhotoAssetRepository;
import com.tripstories.backend.repository.StoryRepository;
import com.tripstories.backend.repository.CommentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class StoryService {

    private final StoryRepository storyRepository;
    private final CommentRepository commentRepository;
    private final StoryPhotoAssetRepository photoAssetRepository;
    private final SocialService socialService;
    private final CloudinaryStorageService cloudinaryStorageService;

    public StoryService(
            StoryRepository storyRepository,
            CommentRepository commentRepository,
            StoryPhotoAssetRepository photoAssetRepository,
            SocialService socialService,
            CloudinaryStorageService cloudinaryStorageService) {
        this.storyRepository = storyRepository;
        this.commentRepository = commentRepository;
        this.photoAssetRepository = photoAssetRepository;
        this.socialService = socialService;
        this.cloudinaryStorageService = cloudinaryStorageService;
    }

    @Transactional(readOnly = true)
    public List<Story> getAllStories() {
        return withCommentCounts(
                storyRepository.findAllByOrderByCreatedAtDesc()
        );
    }

    @Transactional(readOnly = true)
    public Optional<Story> getStoryById(Long id) {
        return storyRepository.findById(id)
                .map(this::withCommentCount);
    }

    @Transactional(readOnly = true)
    public List<Story> getStoriesByAuthor(String email) {
        return withCommentCounts(
                storyRepository.findByAuthorEmailOrderByCreatedAtDesc(email)
        );
    }

    public Story createStory(Story story) {
        return storyRepository.save(story);
    }

    @Transactional
    public Story createStory(
            Story story,
            List<CloudinaryStorageService.UploadedPhoto> uploadedPhotos) {
        story.setPhotos(uploadedPhotos.stream()
                .map(CloudinaryStorageService.UploadedPhoto::url)
                .toList());
        Story savedStory = storyRepository.save(story);
        photoAssetRepository.saveAll(uploadedPhotos.stream()
                .map(photo -> new StoryPhotoAsset(
                        savedStory,
                        photo.url(),
                        photo.publicId()
                ))
                .toList());
        return savedStory;
    }

    private List<Story> withCommentCounts(List<Story> stories) {
        return stories.stream()
                .map(this::withCommentCount)
                .toList();
    }

    private Story withCommentCount(Story story) {
        story.setCommentCount(
                commentRepository.countByStoryId(story.getId())
        );
        return story;
    }

    public Optional<Story> updateStory(
            Long id,
            Story updatedStory,
            String authenticatedEmail) {

        return storyRepository.findById(id)
                .filter(story ->
                        story.getAuthorEmail() != null &&
                                story.getAuthorEmail().equalsIgnoreCase(
                                        authenticatedEmail
                                )
                )
                .map(story -> {
            story.setTitle(updatedStory.getTitle());
            story.setText(updatedStory.getText());
            story.setDestination(updatedStory.getDestination());
            story.setPhotos(updatedStory.getPhotos());

            return storyRepository.save(story);
        });
    }

    @Transactional
    public boolean deleteStory(Long id, String authenticatedEmail) {
        Optional<Story> story = storyRepository.findById(id)
                .filter(existing ->
                        existing.getAuthorEmail() != null &&
                                existing.getAuthorEmail().equalsIgnoreCase(
                                        authenticatedEmail
                                )
                );

        if (story.isEmpty()) {
            return false;
        }

        List<String> publicIds = photoAssetRepository
                .findByStoryId(id)
                .stream()
                .map(StoryPhotoAsset::getPublicId)
                .toList();
        cloudinaryStorageService.deleteImages(publicIds);
        socialService.deleteStorySocialData(id);
        storyRepository.delete(story.get());
        return true;
    }
}