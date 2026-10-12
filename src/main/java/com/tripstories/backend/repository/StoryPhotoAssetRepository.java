package com.tripstories.backend.repository;

import com.tripstories.backend.model.StoryPhotoAsset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StoryPhotoAssetRepository
        extends JpaRepository<StoryPhotoAsset, Long> {

    List<StoryPhotoAsset> findByStoryId(Long storyId);
}
