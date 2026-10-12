package com.tripstories.backend.repository;

import com.tripstories.backend.model.StoryLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StoryLikeRepository extends JpaRepository<StoryLike, Long> {

    List<StoryLike> findByUserEmail(String userEmail);

    Optional<StoryLike> findByUserEmailAndStoryId(
            String userEmail,
            Long storyId
    );

    void deleteByStoryId(Long storyId);
}
