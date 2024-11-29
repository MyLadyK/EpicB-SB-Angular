package com.epicbattle.epicb_api.controller;

import com.epicbattle.epicb_api.model.SurprisePackage;
import com.epicbattle.epicb_api.service.SurprisePackageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/packages")
public class SurprisePackageController {

    @Autowired
    private SurprisePackageService surprisePackageService;

    @GetMapping("/random")
    public ResponseEntity<SurprisePackage> getRandomPackage() {
        SurprisePackage surprisePackage = surprisePackageService.getRandomPackage();
        return ResponseEntity.ok(surprisePackage);
    }
}

