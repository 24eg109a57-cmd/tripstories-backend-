package com.tripstories.backend.controller;

import com.tripstories.backend.model.User;
import com.tripstories.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Get all users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers(
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(
                userService.getUserByEmail(jwt.getSubject())
                        .map(List::of)
                        .orElseGet(List::of)
        );
    }

    // Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {

        Optional<User> user = userService.getUserById(id);

        if (user.isEmpty() ||
                !user.get().getEmail().equalsIgnoreCase(jwt.getSubject())) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(user.get());
    }

    // Get user by email
    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(
            @PathVariable String email,
            @AuthenticationPrincipal Jwt jwt) {
        if (!email.equalsIgnoreCase(jwt.getSubject())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Optional<User> user =
                userService.getUserByEmail(jwt.getSubject());

        if (user.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(user.get());
    }

    // Create user
    @PostMapping
    public ResponseEntity<User> createUser(
            @RequestBody User user,
            @AuthenticationPrincipal Jwt jwt) {
        if (user.getEmail() == null ||
                !user.getEmail().equalsIgnoreCase(jwt.getSubject())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (userService.getUserByEmail(jwt.getSubject()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        return ResponseEntity.ok(
                userService.createUser(user)
        );
    }

    // Update user
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(
            @PathVariable Long id,
            @RequestBody User user,
            @AuthenticationPrincipal Jwt jwt) {
        Optional<User> existingUser = userService.getUserById(id);

        if (existingUser.isEmpty() ||
                !existingUser.get().getEmail().equalsIgnoreCase(
                        jwt.getSubject()
                )) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                userService.updateUser(id, user)
        );
    }

    // Delete user
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {
        Optional<User> existingUser = userService.getUserById(id);

        if (existingUser.isEmpty() ||
                !existingUser.get().getEmail().equalsIgnoreCase(
                        jwt.getSubject()
                )) {
            return ResponseEntity.notFound().build();
        }

        userService.deleteUser(id);

        return ResponseEntity.noContent().build();
    }
}