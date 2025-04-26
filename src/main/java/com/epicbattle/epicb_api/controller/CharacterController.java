package com.epicbattle.epicb_api.controller;

import com.epicbattle.epicb_api.model.Character;
import com.epicbattle.epicb_api.service.CharacterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/characters")
public class CharacterController {

    private final CharacterService characterService;

    @Autowired
    public CharacterController(CharacterService characterService) {
        this.characterService = characterService;
    }

    @GetMapping
    public ResponseEntity<List<Character>> getAllCharacters() {
        List<Character> characters = characterService.getAllCharacters();
        return ResponseEntity.ok(characters);
    }

    @PostMapping
    public ResponseEntity<?> createCharacter(@Valid @RequestBody Character character) {
        try {
            Character created = characterService.createCharacter(character);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCharacterById(@PathVariable int id) {
        try {
            Character character = characterService.getCharacterById(id);
            if (character != null) {
                return ResponseEntity.ok(character);
            } else {
                return ResponseEntity.status(404).body("Personaje no encontrado");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCharacter(@PathVariable int id, @Valid @RequestBody Character characterDetails) {
        try {
            Character updated = characterService.updateCharacter(id, characterDetails);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCharacter(@PathVariable int id) {
        try {
            characterService.deleteCharacter(id);
            return ResponseEntity.ok("Personaje eliminado");
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
