package com.tripstories.backend.service;

import com.tripstories.backend.model.User;
import com.tripstories.backend.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User signup(String username, String email, String password) {
        String normalizedEmail = email.trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = new User(
                username.trim(),
                normalizedEmail,
                passwordEncoder.encode(password)
        );

        return userRepository.save(user);
    }

    public User login(String email, String password) {
        Optional<User> user =
                userRepository.findByEmail(email.trim().toLowerCase());

        if (user.isEmpty()) {
            throw new BadCredentialsException("Invalid email or password.");
        }

        User foundUser = user.get();
        String storedPassword = foundUser.getPassword();

        if (isEncodedPassword(storedPassword)) {
            if (!passwordEncoder.matches(password, storedPassword)) {
                throw new BadCredentialsException(
                        "Invalid email or password."
                );
            }
        } else if (matchesLegacyPassword(storedPassword, password)) {
            foundUser.setPassword(passwordEncoder.encode(password));
            userRepository.save(foundUser);
        } else {
            throw new BadCredentialsException(
                    "Invalid email or password."
            );
        }

        return foundUser;
    }

    private boolean isEncodedPassword(String password) {
        return password != null &&
                (password.startsWith("$2a$") ||
                        password.startsWith("$2b$") ||
                        password.startsWith("$2y$"));
    }

    private boolean matchesLegacyPassword(
            String storedPassword,
            String suppliedPassword) {
        if (storedPassword == null) {
            return false;
        }

        return MessageDigest.isEqual(
                storedPassword.getBytes(StandardCharsets.UTF_8),
                suppliedPassword.getBytes(StandardCharsets.UTF_8)
        );
    }
}