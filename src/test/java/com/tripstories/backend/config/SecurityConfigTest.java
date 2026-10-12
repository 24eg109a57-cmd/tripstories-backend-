package com.tripstories.backend.config;

import com.tripstories.backend.controller.HealthController;
import com.tripstories.backend.controller.SecurityProbeController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = {
        HealthController.class,
        SecurityProbeController.class
})
@Import({SecurityConfig.class, CorsConfig.class})
@TestPropertySource(properties = {
        "app.jwt.secret=local-test-signing-secret-at-least-32-bytes",
        "app.cors.allowed-origin=https://tripstories.example"
})
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtEncoder jwtEncoder;

    @Test
    void healthEndpointIsPublic() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void apiEndpointsRequireBearerAuthentication() throws Exception {
        mockMvc.perform(get("/api/security-probe"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void validBearerTokenCanAccessProtectedEndpoint() throws Exception {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("https://tripstories.local")
                .issuedAt(now)
                .expiresAt(now.plusSeconds(60))
                .subject("traveler@example.com")
                .claim("name", "Traveler")
                .build();
        String token = jwtEncoder.encode(
                JwtEncoderParameters.from(
                        JwsHeader.with(MacAlgorithm.HS256).build(),
                        claims
                )
        ).getTokenValue();

        mockMvc.perform(get("/api/security-probe")
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                "Bearer " + token
                        ))
                .andExpect(status().isOk())
                .andExpect(content().string("ok"));
    }
}
