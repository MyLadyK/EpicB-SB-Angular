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

    public SurprisePackage getRandomPackage() {
        List<SurprisePackage> packages = surprisePackageRepository.findAll();
        Random random = new Random();
        return packages.get(random.nextInt(packages.size()));
    }
}


