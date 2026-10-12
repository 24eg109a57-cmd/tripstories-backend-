package com.tripstories.backend.model;

import jakarta.persistence.*;

@Entity
@Table(
    name = "follows",
    uniqueConstraints = {
        @UniqueConstraint(
            columnNames = {"follower_email", "following_email"}
        )
    }
)
public class Follow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "follower_email", nullable = false)
    private String followerEmail;

    @Column(name = "following_email", nullable = false)
    private String followingEmail;

    public Follow() {
    }

    public Follow(String followerEmail, String followingEmail) {
        this.followerEmail = followerEmail;
        this.followingEmail = followingEmail;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFollowerEmail() {
        return followerEmail;
    }

    public void setFollowerEmail(String followerEmail) {
        this.followerEmail = followerEmail;
    }

    public String getFollowingEmail() {
        return followingEmail;
    }

    public void setFollowingEmail(String followingEmail) {
        this.followingEmail = followingEmail;
    }
}