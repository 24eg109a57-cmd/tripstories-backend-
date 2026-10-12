package com.tripstories.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SecurityProbeController {

    @GetMapping("/api/security-probe")
    public String protectedProbe() {
        return "ok";
    }
}
