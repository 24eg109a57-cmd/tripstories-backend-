package com.tripstories.backend.repository;

import com.tripstories.backend.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByStoryId(Long storyId);

    long countByStoryId(Long storyId);

    void deleteByStoryId(Long storyId);
}