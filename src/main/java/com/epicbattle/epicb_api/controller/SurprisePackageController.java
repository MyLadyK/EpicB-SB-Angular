package com.epicbattle.epicb_api.controller;

import com.epicbattle.epicb_api.model.SurprisePackage;
import com.epicbattle.epicb_api.service.SurprisePackageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/surprise-packages")
public class SurprisePackageController {

    @Autowired
    private SurprisePackageService surprisePackageService;

    /**
     * Obtiene un paquete sorpresa aleatorio
     */
    @GetMapping("/random")
    public ResponseEntity<?> getRandomSurprisePackage() {
        try {
            SurprisePackage surprise = surprisePackageService.getRandomSurprisePackage();
            if (surprise == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(surprise);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al obtener paquete sorpresa: " + e.getMessage());
        }
    }
}
