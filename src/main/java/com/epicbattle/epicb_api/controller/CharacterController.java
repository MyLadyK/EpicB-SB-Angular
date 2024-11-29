package com.epicbattle.epicb_api.controller;


import com.epicbattle.epicb_api.model.Character;
import com.epicbattle.epicb_api.service.CharacterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/characters")
public class CharacterController {

    private final CharacterService characterService;

    @Autowired
    public CharacterController(CharacterService characterService) {
        this.characterService = characterService;
    }

    @GetMapping
    public Page<com.epicbattle.epicb_api.model.Character> getAllCharacters(Pageable pageable) {
        return characterService.getAllCharacters(pageable);
    }

    @PostMapping
    public com.epicbattle.epicb_api.model.Character createCharacter(@RequestBody com.epicbattle.epicb_api.model.Character character) {
        return characterService.createCharacter(character);
    }

    @GetMapping("/{id}")
    public com.epicbattle.epicb_api.model.Character getCharacterById(@PathVariable int id) {
        return characterService.getCharacterById(id);
    }

    @PutMapping("/{id}")
    public com.epicbattle.epicb_api.model.Character updateCharacter(@PathVariable int id, @RequestBody Character characterDetails) {
        return characterService.updateCharacter(id, characterDetails);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCharacter(@PathVariable int id) {
        characterService.deleteCharacter(id);
        return ResponseEntity.ok("Personaje eliminado");
    }
}
