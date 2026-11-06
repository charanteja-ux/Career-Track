
package com.careertrack.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/api/health")
    public String healthCheck() {
        return "CareerTrack Backend is Working!";
    }
}