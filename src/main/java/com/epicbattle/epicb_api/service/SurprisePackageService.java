package com.epicbattle.epicb_api.service;

import com.epicbattle.epicb_api.model.SurprisePackage;
import com.epicbattle.epicb_api.repository.SurprisePackageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

// SurprisePackageService.java
@Service
public class SurprisePackageService {

    @Autowired
    private SurprisePackageRepository surprisePackageRepository;

    /**
     * Obtiene un paquete sorpresa aleatorio de la base de datos.
     * Lanza excepción si no hay paquetes disponibles.
     */
    public SurprisePackage getRandomPackage() {
        List<SurprisePackage> packages = surprisePackageRepository.findAll();
        if (packages.isEmpty()) {
            throw new com.epicbattle.epicb_api.exception.ResourceNotFoundException("No hay paquetes sorpresa disponibles en la base de datos");
        }
        Random random = new Random();
        return packages.get(random.nextInt(packages.size()));
    }
}
