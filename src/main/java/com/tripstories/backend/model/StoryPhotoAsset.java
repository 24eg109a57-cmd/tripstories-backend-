package com.tripstories.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "story_photo_assets")
public class StoryPhotoAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "story_id", nullable = false)
    private Story story;

    @Column(name = "photo_url", nullable = false, length = 2000)
    private String photoUrl;

    @Column(name = "public_id", nullable = false, length = 512)
    private String publicId;

    protected StoryPhotoAsset() {
    }

    public StoryPhotoAsset(Story story, String photoUrl, String publicId) {
        this.story = story;
        this.photoUrl = photoUrl;
        this.publicId = publicId;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public String getPublicId() {
        return publicId;
    }
}
