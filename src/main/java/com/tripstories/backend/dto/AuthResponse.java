package com.tripstories.backend.dto;

public record AuthResponse(
        String accessToken,
        AuthenticatedUser user) {
}
