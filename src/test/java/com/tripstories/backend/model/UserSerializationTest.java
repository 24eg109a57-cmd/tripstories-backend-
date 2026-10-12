package com.tripstories.backend.model;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UserSerializationTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void passwordIsAcceptedOnInputButNeverSerialized() throws Exception {
        User user = objectMapper.readValue(
                """
                {
                  "username": "Traveler",
                  "email": "traveler@example.com",
                  "password": "submitted-password"
                }
                """,
                User.class
        );

        assertEquals("submitted-password", user.getPassword());

        String responseJson = objectMapper.writeValueAsString(user);

        assertFalse(responseJson.contains("password"));
        assertFalse(responseJson.contains("submitted-password"));
        assertTrue(responseJson.contains("traveler@example.com"));
    }
}
