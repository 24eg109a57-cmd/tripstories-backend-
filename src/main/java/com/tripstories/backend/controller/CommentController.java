package com.tripstories.backend.controller;

import com.tripstories.backend.model.Comment;
import com.tripstories.backend.service.SocialService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.time.Instant;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final SocialService socialService;

    public CommentController(SocialService socialService) {
        this.socialService = socialService;
    }

    @GetMapping("/story/{storyId}")
    public List<Comment> getComments(
            @PathVariable Long storyId) {

        return socialService.getComments(storyId);
    }

    @PostMapping("/story/{storyId}")
    public ResponseEntity<Comment> addComment(
            @PathVariable Long storyId,
            @RequestBody Comment comment,
            @AuthenticationPrincipal Jwt jwt) {
        comment.setAuthorEmail(jwt.getSubject());
        comment.setAuthor(jwt.getClaimAsString("name"));
        comment.setAvatar(
                jwt.getClaimAsString("name").substring(0, 1).toUpperCase()
        );
        comment.setDate(Long.toString(Instant.now().toEpochMilli()));

        return ResponseEntity.ok(
                socialService.addComment(storyId, comment)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {

        if (socialService.deleteComment(id, jwt.getSubject())) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}
