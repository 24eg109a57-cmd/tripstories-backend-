package com.tripstories.backend.service;

import com.tripstories.backend.model.Comment;
import com.tripstories.backend.model.Follow;
import com.tripstories.backend.model.SavedStory;
import com.tripstories.backend.model.Story;
import com.tripstories.backend.model.StoryLike;
import com.tripstories.backend.repository.CommentRepository;
import com.tripstories.backend.repository.FollowRepository;
import com.tripstories.backend.repository.SavedStoryRepository;
import com.tripstories.backend.repository.StoryRepository;
import com.tripstories.backend.repository.StoryLikeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class SocialService {

    private final CommentRepository commentRepository;
    private final FollowRepository followRepository;
    private final SavedStoryRepository savedStoryRepository;
    private final StoryLikeRepository storyLikeRepository;
    private final StoryRepository storyRepository;

    public SocialService(
            CommentRepository commentRepository,
            FollowRepository followRepository,
            SavedStoryRepository savedStoryRepository,
            StoryLikeRepository storyLikeRepository,
            StoryRepository storyRepository) {

        this.commentRepository = commentRepository;
        this.followRepository = followRepository;
        this.savedStoryRepository = savedStoryRepository;
        this.storyLikeRepository = storyLikeRepository;
        this.storyRepository = storyRepository;
    }

    public List<Comment> getComments(Long storyId) {
        return commentRepository.findByStoryId(storyId);
    }

    public Comment addComment(Long storyId, Comment comment) {
        comment.setStoryId(storyId);
        return commentRepository.save(comment);
    }

    public boolean deleteComment(Long id, String authenticatedEmail) {
        Comment comment = commentRepository.findById(id).orElse(null);

        if (comment == null ||
                comment.getAuthorEmail() == null ||
                !comment.getAuthorEmail().equalsIgnoreCase(
                        authenticatedEmail
                )) {
            return false;
        }

        commentRepository.delete(comment);
        return true;
    }

    public List<Follow> getFollowers(String email) {
        return followRepository.findByFollowingEmail(email);
    }

    public List<Follow> getFollowing(String email) {
        return followRepository.findByFollowerEmail(email);
    }

    public Follow followUser(Follow follow) {
        return followRepository
                .findByFollowerEmailAndFollowingEmail(
                        follow.getFollowerEmail(),
                        follow.getFollowingEmail()
                )
                .orElseGet(() -> followRepository.save(follow));
    }

    public boolean unfollowUser(Long id, String authenticatedEmail) {
        Follow follow = followRepository.findById(id).orElse(null);

        if (follow == null ||
                !follow.getFollowerEmail().equalsIgnoreCase(
                        authenticatedEmail
                )) {
            return false;
        }

        followRepository.delete(follow);
        return true;
    }

    @Transactional
    public Optional<Story> toggleLike(
            Long storyId,
            String authenticatedEmail) {
        Optional<Story> foundStory = storyRepository.findById(storyId);

        if (foundStory.isEmpty()) {
            return Optional.empty();
        }

        Story story = foundStory.get();

        var existingLike = storyLikeRepository
                .findByUserEmailAndStoryId(
                        authenticatedEmail,
                        storyId
                );

        if (existingLike.isPresent()) {
            storyLikeRepository.delete(existingLike.get());
            story.setLikes(Math.max(0, story.getLikes() - 1));
        } else {
            storyLikeRepository.save(
                    new StoryLike(authenticatedEmail, storyId)
            );
            story.setLikes(story.getLikes() + 1);
        }

        return Optional.of(storyRepository.save(story));
    }

    public List<Long> getLikedStoryIds(String authenticatedEmail) {
        return storyLikeRepository.findByUserEmail(authenticatedEmail)
                .stream()
                .map(StoryLike::getStoryId)
                .toList();
    }

    public List<Long> getSavedStoryIds(String authenticatedEmail) {
        return savedStoryRepository.findByUserEmail(authenticatedEmail)
                .stream()
                .map(SavedStory::getStoryId)
                .toList();
    }

    @Transactional
    public boolean saveStory(Long storyId, String authenticatedEmail) {
        if (!storyRepository.existsById(storyId)) {
            return false;
        }

        savedStoryRepository.findByUserEmailAndStoryId(
                authenticatedEmail,
                storyId
        ).orElseGet(() ->
                savedStoryRepository.save(
                        new SavedStory(authenticatedEmail, storyId)
                )
        );
        return true;
    }

    public void unsaveStory(Long storyId, String authenticatedEmail) {
        savedStoryRepository.findByUserEmailAndStoryId(
                authenticatedEmail,
                storyId
        ).ifPresent(savedStoryRepository::delete);
    }

    @Transactional
    public void deleteStorySocialData(Long storyId) {
        commentRepository.deleteByStoryId(storyId);
        storyLikeRepository.deleteByStoryId(storyId);
        savedStoryRepository.deleteByStoryId(storyId);
    }
}