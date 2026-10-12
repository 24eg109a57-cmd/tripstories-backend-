package com.tripstories.backend.dto;

public record AuthenticatedUser(
        Long id,
        String username,
        String email,
        String bio,
        String profileImage) {
}
