package com.tripstories.backend.service;

import com.tripstories.backend.model.User;
import com.tripstories.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    private final UserRepository userRepository = mock(UserRepository.class);
    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder(4);
    private final AuthService authService =
            new AuthService(userRepository, passwordEncoder);

    @Test
    void signupHashesPasswordAndLoginVerifiesIt() {
        when(userRepository.existsByEmail("traveler@example.com"))
                .thenReturn(false);
        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        User created = authService.signup(
                "Traveler",
                " Traveler@Example.com ",
                "safe-pass-123"
        );

        assertNotEquals("safe-pass-123", created.getPassword());
        assertTrue(passwordEncoder.matches(
                "safe-pass-123",
                created.getPassword()
        ));

        when(userRepository.findByEmail("traveler@example.com"))
                .thenReturn(Optional.of(created));

        assertSame(
                created,
                authService.login(
                        "TRAVELER@example.com",
                        "safe-pass-123"
                )
        );
    }

    @Test
    void successfulLegacyPasswordLoginRehashesPassword() {
        User legacyUser = new User(
                "Traveler",
                "traveler@example.com",
                "old-plain-password"
        );
        when(userRepository.findByEmail("traveler@example.com"))
                .thenReturn(Optional.of(legacyUser));
        when(userRepository.save(legacyUser)).thenReturn(legacyUser);

        authService.login(
                "traveler@example.com",
                "old-plain-password"
        );

        assertNotEquals("old-plain-password", legacyUser.getPassword());
        assertTrue(passwordEncoder.matches(
                "old-plain-password",
                legacyUser.getPassword()
        ));
        verify(userRepository).save(legacyUser);
    }

    @Test
    void invalidPasswordIsRejected() {
        User user = new User(
                "Traveler",
                "traveler@example.com",
                passwordEncoder.encode("correct-password")
        );
        when(userRepository.findByEmail("traveler@example.com"))
                .thenReturn(Optional.of(user));

        assertThrows(
                BadCredentialsException.class,
                () -> authService.login(
                        "traveler@example.com",
                        "wrong-password"
                )
        );
    }
}
