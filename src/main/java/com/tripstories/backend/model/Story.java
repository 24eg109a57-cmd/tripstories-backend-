package com.tripstories.backend.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "stories")
public class Story {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 5000)
    private String text;

    private String destination;

    private String authorEmail;

    private String authorName;

    private LocalDateTime createdAt;

    private int likes;

    @Transient
    private long commentCount;

    private boolean saved;

    @ElementCollection
    @CollectionTable(
        name = "story_photos",
        joinColumns = @JoinColumn(name = "story_id")
    )
    @OrderColumn(name = "photo_order")
    @Column(name = "photo_url", length = 2000)
    private List<String> photos = new ArrayList<>();

    @JsonIgnore
    @OneToMany(
        mappedBy = "story",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    private List<StoryPhotoAsset> photoAssets = new ArrayList<>();

    public Story() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public String getAuthorEmail() {
        return authorEmail;
    }

    public void setAuthorEmail(String authorEmail) {
        this.authorEmail = authorEmail;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public int getLikes() {
        return likes;
    }

    public void setLikes(int likes) {
        this.likes = likes;
    }

    public boolean isSaved() {
        return saved;
    }

    public void setSaved(boolean saved) {
        this.saved = saved;
    }

    public List<String> getPhotos() {
        return photos;
    }

    public void setPhotos(List<String> photos) {
        this.photos = photos == null ? new ArrayList<>() : new ArrayList<>(photos);
    }

    public long getCommentCount() {
        return commentCount;
    }

    public void setCommentCount(long commentCount) {
        this.commentCount = commentCount;
    }

    public List<StoryPhotoAsset> getPhotoAssets() {
        return photoAssets;
    }

    public void setPhotoAssets(List<StoryPhotoAsset> photoAssets) {
        this.photoAssets = photoAssets;
    }
}