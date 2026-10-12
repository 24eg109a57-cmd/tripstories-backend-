-- Proposed schema derived from the TripStories JPA mappings.
-- Review before manual execution. This file is not named schema.sql and is
-- not automatically executed by Spring Boot.

CREATE TABLE users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    username VARCHAR(255),
    email VARCHAR(255),
    password VARCHAR(255),
    bio VARCHAR(255),
    profile_image VARCHAR(255),
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE stories (
    id BIGINT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255),
    text VARCHAR(5000),
    destination VARCHAR(255),
    author_email VARCHAR(255),
    author_name VARCHAR(255),
    created_at DATETIME(6),
    likes INT NOT NULL,
    saved BIT NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE story_photos (
    story_id BIGINT NOT NULL,
    photo_order INT NOT NULL,
    photo_url VARCHAR(2000),
    PRIMARY KEY (story_id, photo_order),
    CONSTRAINT fk_story_photos_story
        FOREIGN KEY (story_id) REFERENCES stories (id)
) ENGINE=InnoDB;

CREATE TABLE story_photo_assets (
    id BIGINT NOT NULL AUTO_INCREMENT,
    story_id BIGINT NOT NULL,
    photo_url VARCHAR(2000) NOT NULL,
    public_id VARCHAR(512) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_story_photo_assets_story
        FOREIGN KEY (story_id) REFERENCES stories (id)
) ENGINE=InnoDB;

CREATE TABLE comments (
    id BIGINT NOT NULL AUTO_INCREMENT,
    story_id BIGINT,
    author VARCHAR(255),
    author_email VARCHAR(255),
    avatar VARCHAR(255),
    text TEXT,
    date VARCHAR(255),
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE follows (
    id BIGINT NOT NULL AUTO_INCREMENT,
    follower_email VARCHAR(255) NOT NULL,
    following_email VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_follows_follower_following
        UNIQUE (follower_email, following_email)
) ENGINE=InnoDB;

CREATE TABLE story_likes (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_email VARCHAR(255) NOT NULL,
    story_id BIGINT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_story_likes_user_story
        UNIQUE (user_email, story_id)
) ENGINE=InnoDB;

CREATE TABLE saved_stories (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_email VARCHAR(255) NOT NULL,
    story_id BIGINT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_saved_stories_user_story
        UNIQUE (user_email, story_id)
) ENGINE=InnoDB;
