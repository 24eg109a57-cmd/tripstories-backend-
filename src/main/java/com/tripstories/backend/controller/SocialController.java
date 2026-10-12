package com.tripstories.backend.controller;

import com.tripstories.backend.model.Follow;
import com.tripstories.backend.service.SocialService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/social")
public class SocialController {

    private final SocialService socialService;

    public SocialController(SocialService socialService) {
        this.socialService = socialService;
    }

    @GetMapping("/followers/{email}")
    public ResponseEntity<List<Follow>> getFollowers(
            @PathVariable String email,
            @AuthenticationPrincipal Jwt jwt) {
        if (!email.equalsIgnoreCase(jwt.getSubject())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(socialService.getFollowers(jwt.getSubject()));
    }

    @GetMapping("/following/{email}")
    public ResponseEntity<List<Follow>> getFollowing(
            @PathVariable String email,
            @AuthenticationPrincipal Jwt jwt) {
        if (!email.equalsIgnoreCase(jwt.getSubject())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(socialService.getFollowing(jwt.getSubject()));
    }

    @PostMapping("/follow")
    public ResponseEntity<Follow> follow(
            @RequestBody Follow follow,
            @AuthenticationPrincipal Jwt jwt) {
        if (follow.getFollowingEmail() == null ||
                follow.getFollowingEmail().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        follow.setFollowerEmail(jwt.getSubject());
        if (follow.getFollowerEmail().equalsIgnoreCase(
                follow.getFollowingEmail()
        )) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(
                socialService.followUser(follow)
        );
    }

    @DeleteMapping("/unfollow/{id}")
    public ResponseEntity<Void> unfollow(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {

        if (!socialService.unfollowUser(id, jwt.getSubject())) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/like/{storyId}")
    public ResponseEntity<?> likeStory(
            @PathVariable Long storyId,
            @AuthenticationPrincipal Jwt jwt) {

        return socialService.toggleLike(storyId, jwt.getSubject())
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/likes")
    public List<Long> getLikedStories(
            @AuthenticationPrincipal Jwt jwt) {
        return socialService.getLikedStoryIds(jwt.getSubject());
    }

    @GetMapping("/saved")
    public List<Long> getSavedStories(
            @AuthenticationPrincipal Jwt jwt) {
        return socialService.getSavedStoryIds(jwt.getSubject());
    }

    @PutMapping("/saved/{storyId}")
    public ResponseEntity<Void> saveStory(
            @PathVariable Long storyId,
            @AuthenticationPrincipal Jwt jwt) {
        if (!socialService.saveStory(storyId, jwt.getSubject())) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/saved/{storyId}")
    public ResponseEntity<Void> unsaveStory(
            @PathVariable Long storyId,
            @AuthenticationPrincipal Jwt jwt) {
        socialService.unsaveStory(storyId, jwt.getSubject());
        return ResponseEntity.noContent().build();
    }
}