package com.tripstories.backend.service;

import com.tripstories.backend.model.Story;
import com.tripstories.backend.model.StoryPhotoAsset;
import com.tripstories.backend.repository.CommentRepository;
import com.tripstories.backend.repository.StoryPhotoAssetRepository;
import com.tripstories.backend.repository.StoryRepository;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;
import java.util.stream.StreamSupport;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class StoryServiceTest {

    private final StoryRepository storyRepository = mock(StoryRepository.class);
    private final CommentRepository commentRepository = mock(CommentRepository.class);
    private final StoryPhotoAssetRepository photoAssetRepository =
            mock(StoryPhotoAssetRepository.class);
    private final SocialService socialService = mock(SocialService.class);
    private final CloudinaryStorageService cloudinaryStorageService =
            mock(CloudinaryStorageService.class);
    private final StoryService storyService = new StoryService(
            storyRepository,
            commentRepository,
            photoAssetRepository,
            socialService,
            cloudinaryStorageService
    );

    @Test
    void savesImageUrlsAndCloudinaryIdsWithStory() {
        Story story = new Story();
        List<CloudinaryStorageService.UploadedPhoto> photos = List.of(
                new CloudinaryStorageService.UploadedPhoto(
                        "https://res.cloudinary.com/demo/first.jpg",
                        "tripstories/stories/first"
                ),
                new CloudinaryStorageService.UploadedPhoto(
                        "https://res.cloudinary.com/demo/second.jpg",
                        "tripstories/stories/second"
                )
        );
        when(storyRepository.save(story)).thenAnswer(invocation -> {
            story.setId(12L);
            return story;
        });
        when(photoAssetRepository.saveAll(any())).thenAnswer(
                invocation -> invocation.getArgument(0)
        );

        Story saved = storyService.createStory(story, photos);

        assertEquals(
                List.of(
                        "https://res.cloudinary.com/demo/first.jpg",
                        "https://res.cloudinary.com/demo/second.jpg"
                ),
                saved.getPhotos()
        );
        verify(photoAssetRepository).saveAll(argThat(assets -> {
            List<StoryPhotoAsset> savedAssets = StreamSupport.stream(
                    assets.spliterator(),
                    false
            ).toList();
            return savedAssets.size() == 2 &&
                    "tripstories/stories/first".equals(
                            savedAssets.get(0).getPublicId()
                    ) &&
                    "tripstories/stories/second".equals(
                            savedAssets.get(1).getPublicId()
                    );
        }));
    }

    @Test
    void deletesCloudinaryAssetsOnlyForTheStoryOwner() {
        Story story = new Story();
        story.setId(12L);
        story.setAuthorEmail("owner@example.com");
        when(storyRepository.findById(12L)).thenReturn(Optional.of(story));
        when(photoAssetRepository.findByStoryId(12L)).thenReturn(List.of(
                new StoryPhotoAsset(
                        story,
                        "https://res.cloudinary.com/demo/photo.jpg",
                        "tripstories/stories/photo"
                )
        ));

        assertTrue(storyService.deleteStory(12L, "owner@example.com"));

        verify(cloudinaryStorageService)
                .deleteImages(List.of("tripstories/stories/photo"));
        verify(storyRepository).delete(story);
    }

    @Test
    void refusesStoryDeletionForAnotherUserWithoutDeletingImages() {
        Story story = new Story();
        story.setId(12L);
        story.setAuthorEmail("owner@example.com");
        when(storyRepository.findById(12L)).thenReturn(Optional.of(story));

        assertFalse(storyService.deleteStory(12L, "other@example.com"));

        verifyNoInteractions(cloudinaryStorageService);
        verify(storyRepository, never()).delete(any(Story.class));
    }
}
