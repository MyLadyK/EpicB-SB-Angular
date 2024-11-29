package com.epicbattle.epicb_api.service;

import com.epicbattle.epicb_api.exception.GlobalExceptionHandler;
import com.epicbattle.epicb_api.model.Character;
import com.epicbattle.epicb_api.repository.CharacterRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;


@Service
public class CharacterService {

    private final CharacterRepository characterRepository;

    public CharacterService(CharacterRepository characterRepository) {
        this.characterRepository = characterRepository;
    }

    // Implementar paginación, lo que solicita resultados en "páginas" y no todos a la vez.
    public Page<Character> getAllCharacters(Pageable pageable) {
        return characterRepository.findAll(pageable);
    }

    public Character createCharacter(Character character) {
        return characterRepository.save(character);
    }

    public Character getCharacterById(int id) {
        return characterRepository.findById(id)
                .orElseThrow(() -> new GlobalExceptionHandler.ResourceNotFoundException("Personaje no encontrado"));
    }

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

    public ResponseEntity<String> deleteCharacter(int idCharacter) {
        Character character = getCharacterById(idCharacter);
        characterRepository.delete(character);
        return ResponseEntity.ok("Personaje eliminado");
    }
}

