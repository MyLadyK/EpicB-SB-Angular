package com.epicbattle.epicb_api.controller;

import com.epicbattle.epicb_api.model.Character;
import com.epicbattle.epicb_api.service.CharacterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public Character createCharacter(@RequestBody Character character) {
        return characterService.createCharacter(character);
    }

    @GetMapping("/{id}")
    public Character getCharacterById(@PathVariable int id) {
        return characterService.getCharacterById(id);
    }

    @PutMapping("/{id}")
    public Character updateCharacter(@PathVariable int id, @RequestBody Character characterDetails) {
        return characterService.updateCharacter(id, characterDetails);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCharacter(@PathVariable int id) {
        characterService.deleteCharacter(id);
        return ResponseEntity.ok("Personaje eliminado");
    }
}

