package com.tripstories.backend.controller;

import com.tripstories.backend.dto.AuthResponse;
import com.tripstories.backend.dto.AuthenticatedUser;
import com.tripstories.backend.dto.LoginRequest;
import com.tripstories.backend.dto.SignupRequest;
import com.tripstories.backend.model.User;
import com.tripstories.backend.service.AuthService;
import com.tripstories.backend.service.JwtTokenService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtTokenService jwtTokenService;

    public AuthController(
            AuthService authService,
            JwtTokenService jwtTokenService) {
        this.authService = authService;
        this.jwtTokenService = jwtTokenService;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(
            @Valid @RequestBody SignupRequest request) {
        try {
            User createdUser = authService.signup(
                    request.username(),
                    request.email(),
                    request.password()
            );
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(createAuthResponse(createdUser));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {
        try {
            User loggedInUser = authService.login(
                    request.email(),
                    request.password()
            );
            return ResponseEntity.ok(createAuthResponse(loggedInUser));
        } catch (BadCredentialsException exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    private AuthResponse createAuthResponse(User user) {
        return new AuthResponse(
                jwtTokenService.createAccessToken(user),
                new AuthenticatedUser(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getBio(),
                        user.getProfileImage()
                )
        );
    }
}