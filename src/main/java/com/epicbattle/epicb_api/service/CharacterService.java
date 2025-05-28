package com.epicbattle.epicb_api.service;

import com.epicbattle.epicb_api.model.Character;
import com.epicbattle.epicb_api.repository.CharacterRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Servicio para gestión de personajes.
 */
@Service
public class CharacterService {

    private final CharacterRepository characterRepository;

    public CharacterService(CharacterRepository characterRepository) {
        this.characterRepository = characterRepository;
    }

    /**
     * Devuelve todos los personajes sin paginación.
     */
    public List<Character> getAllCharacters() {
        return characterRepository.findAll();
    }

    /**
     * Crea un nuevo personaje.
     */
    public Character createCharacter(Character character) {
        return characterRepository.save(character);
    }

    /**
     * Obtiene un personaje por su ID. Lanza excepción si no existe.
     */
    public Character getCharacterById(int id) {
        return characterRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Personaje no encontrado con id: " + id));
    }

    /**
     * Actualiza los datos de un personaje existente.
     */
    public Character updateCharacter(int id, Character characterDetails) {
        Character character = getCharacterById(id);

        character.setNameCharacter(characterDetails.getNameCharacter());
        character.setCategoryCharacter(characterDetails.getCategoryCharacter());
        character.setUniverseCharacter(characterDetails.getUniverseCharacter());
        character.setHealthCharacter(characterDetails.getHealthCharacter());
        character.setAttackCharacter(characterDetails.getAttackCharacter());
        character.setDefenseCharacter(characterDetails.getDefenseCharacter());
        character.setSpeedCharacter(characterDetails.getSpeedCharacter());
        character.setStaminaCharacter(characterDetails.getStaminaCharacter());
        character.setIntelligenceCharacter(characterDetails.getIntelligenceCharacter());
        character.setSpecialCharacter(characterDetails.getSpecialCharacter());
        character.setImageUrl(characterDetails.getImageUrl());

        return characterRepository.save(character);
    }

    /**
     * Elimina un personaje por su ID. Lanza excepción si no existe.
     */
    public void deleteCharacter(int idCharacter) {
        Character character = getCharacterById(idCharacter);
        characterRepository.delete(character);
    }
}
