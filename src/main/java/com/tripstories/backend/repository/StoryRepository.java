package com.tripstories.backend.repository;

import com.tripstories.backend.model.Story;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StoryRepository extends JpaRepository<Story, Long> {

    List<Story> findAllByOrderByCreatedAtDesc();

    List<Story> findByAuthorEmailOrderByCreatedAtDesc(String authorEmail);

    List<Story> findByDestinationContainingIgnoreCase(String destination);

    List<Story> findByTitleContainingIgnoreCase(String title);
}