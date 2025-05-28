package com.epicbattle.epicb_api.service;

import com.epicbattle.epicb_api.model.SurprisePackage;
import com.epicbattle.epicb_api.model.UserCharacter;
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

    @Autowired
    private UserCharacterService userCharacterService;

    /**
     * Obtiene un paquete sorpresa aleatorio de la base de datos.
     * Lanza excepción si no hay paquetes disponibles.
     */
    public SurprisePackage getRandomSurprisePackage() {
        List<SurprisePackage> packages = surprisePackageRepository.findAll();
        if (packages.isEmpty()) {
            return null;
        }
        Random random = new Random();
        return packages.get(random.nextInt(packages.size()));
    }

    public void applyPackageToCharacter(UserCharacter character, SurprisePackage pack) {
        switch (pack.getModificationType().toLowerCase()) {
            case "attack":
                character.setAttackUserCharacter(character.getAttackUserCharacter() + pack.getModificationValue());
                break;
            case "defense":
                character.setDefenseUserCharacter(character.getDefenseUserCharacter() + pack.getModificationValue());
                break;
            case "health":
                character.setHealthUserCharacter(character.getHealthUserCharacter() + pack.getModificationValue());
                break;
            case "speed":
                character.setSpeedUserCharacter(character.getSpeedUserCharacter() + pack.getModificationValue());
                break;
            case "stamina":
                character.setStaminaUserCharacter(character.getStaminaUserCharacter() + pack.getModificationValue());
                break;
            case "intelligence":
                character.setIntelligenceUserCharacter(character.getIntelligenceUserCharacter() + pack.getModificationValue());
                break;
            case "special":
                character.setSpecialUserCharacter(character.getSpecialUserCharacter() + pack.getModificationValue());
                break;
        }
        userCharacterService.save(character);
    }
}
