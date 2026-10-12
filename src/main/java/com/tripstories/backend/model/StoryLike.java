package com.tripstories.backend.model;

import jakarta.persistence.*;

@Entity
@Table(
        name = "story_likes",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"user_email", "story_id"}
        )
)
public class StoryLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(name = "story_id", nullable = false)
    private Long storyId;

    protected StoryLike() {
    }

    public StoryLike(String userEmail, Long storyId) {
        this.userEmail = userEmail;
        this.storyId = storyId;
    }

    public Long getId() {
        return id;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public Long getStoryId() {
        return storyId;
    }
}
