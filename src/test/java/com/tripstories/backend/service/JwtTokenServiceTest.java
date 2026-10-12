package com.tripstories.backend.service;

import com.tripstories.backend.config.SecurityConfig;
import com.tripstories.backend.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtEncoder;

import java.time.Duration;
import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenServiceTest {

    private static final String SECRET =
            "local-test-signing-secret-at-least-32-bytes";

    private final SecurityConfig securityConfig = new SecurityConfig();

    @Test
    void signsAndVerifiesShortLivedTokenForTheUser() {
        JwtEncoder encoder = securityConfig.jwtEncoder(SECRET);
        JwtDecoder decoder = securityConfig.jwtDecoder(SECRET);
        JwtTokenService tokenService = new JwtTokenService(encoder);
        User user = new User(
                "Traveler",
                "traveler@example.com",
                "not-used-in-token"
        );

        Jwt token = decoder.decode(tokenService.createAccessToken(user));

        assertEquals("traveler@example.com", token.getSubject());
        assertEquals("Traveler", token.getClaimAsString("name"));
        assertEquals(
                "https://tripstories.local",
                token.getIssuer().toString()
        );

        Duration lifetime = Duration.between(
                token.getIssuedAt(),
                token.getExpiresAt()
        );
        assertEquals(Duration.ofMinutes(15), lifetime);
        assertTrue(token.getExpiresAt().isAfter(Instant.now()));
    }

    @Test
    void rejectsTokensSignedWithAnotherSecret() {
        JwtEncoder encoder = securityConfig.jwtEncoder(SECRET);
        JwtDecoder decoder = securityConfig.jwtDecoder(
                "different-test-signing-secret-at-least-32-bytes"
        );
        JwtTokenService tokenService = new JwtTokenService(encoder);
        User user = new User(
                "Traveler",
                "traveler@example.com",
                "not-used-in-token"
        );

        assertThrows(
                JwtException.class,
                () -> decoder.decode(tokenService.createAccessToken(user))
        );
    }
}
