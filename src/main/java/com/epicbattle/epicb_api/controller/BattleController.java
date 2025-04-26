package com.epicbattle.epicb_api.controller;

import com.epicbattle.epicb_api.dto.BattleRequestDTO;
import com.epicbattle.epicb_api.dto.BattleSummary;
import com.epicbattle.epicb_api.exception.ResourceNotFoundException;
import com.epicbattle.epicb_api.model.BattleResult;
import com.epicbattle.epicb_api.model.Character;
import com.epicbattle.epicb_api.model.User;
import com.epicbattle.epicb_api.service.BattleService;
import com.epicbattle.epicb_api.service.CharacterService;
import com.epicbattle.epicb_api.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/battles")
public class BattleController {

    @Autowired
    private BattleService battleService;

    @Autowired
    private UserService userService;

    @Autowired
    private CharacterService characterService;

    @PostMapping("/fight")
    public ResponseEntity<?> battle(@Valid @RequestBody BattleRequestDTO battleData){
        try {
            User user1 = userService.getUserById(battleData.getUser1Id())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario 1 no encontrado"));
            User user2 = userService.getUserById(battleData.getUser2Id())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario 2 no encontrado"));

            Character character1 = characterService.getCharacterById(battleData.getCharacter1Id());
            Character character2 = characterService.getCharacterById(battleData.getCharacter2Id());

            int userCharacter1Id = battleData.getUserCharacter1Id();
            int userCharacter2Id = battleData.getUserCharacter2Id();

            BattleResult result = battleService.battle(user1, character1, user2, character2, userCharacter1Id, userCharacter2Id);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/fight/summary")
    public ResponseEntity<?> battleSummary(@Valid @RequestBody BattleRequestDTO battleData){
        try {
            User user1 = userService.getUserById(battleData.getUser1Id())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario 1 no encontrado"));
            User user2 = userService.getUserById(battleData.getUser2Id())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario 2 no encontrado"));

            Character character1 = characterService.getCharacterById(battleData.getCharacter1Id());
            Character character2 = characterService.getCharacterById(battleData.getCharacter2Id());

            int userCharacter1Id = battleData.getUserCharacter1Id();
            int userCharacter2Id = battleData.getUserCharacter2Id();

            BattleSummary summary = battleService.battleWithSummary(user1, character1, user2, character2, userCharacter1Id, userCharacter2Id);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getBattlesByUser(@PathVariable int userId) {
        try {
            return ResponseEntity.ok(battleService.getBattlesByUser(userId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
