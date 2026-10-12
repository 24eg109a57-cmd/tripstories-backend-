package com.tripstories.backend.repository;

import com.tripstories.backend.model.SavedStory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavedStoryRepository extends JpaRepository<SavedStory, Long> {

    List<SavedStory> findByUserEmail(String userEmail);

    Optional<SavedStory> findByUserEmailAndStoryId(
            String userEmail,
            Long storyId
    );

    void deleteByStoryId(Long storyId);
}
