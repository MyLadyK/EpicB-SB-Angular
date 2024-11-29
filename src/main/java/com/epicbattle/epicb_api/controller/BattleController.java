package com.epicbattle.epicb_api.controller;

import com.epicbattle.epicb_api.exception.GlobalExceptionHandler;
import com.epicbattle.epicb_api.model.BattleResult;
import com.epicbattle.epicb_api.model.Character;
import com.epicbattle.epicb_api.model.User;
import com.epicbattle.epicb_api.service.BattleService;
import com.epicbattle.epicb_api.service.CharacterService;
import com.epicbattle.epicb_api.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

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
    public ResponseEntity<BattleResult> battle(@RequestBody Map<String, Integer> battleData){
        User user1 = userService.getUserById(battleData.get("user1Id")).orElseThrow(() -> new GlobalExceptionHandler.ResourceNotFoundException("Usuario 1 no encontrado"));
        User user2 = userService.getUserById(battleData.get("user2Id")).orElseThrow(() -> new GlobalExceptionHandler.ResourceNotFoundException("Usuario 2 no encontrado"));

        Character character1 = characterService.getCharacterById(battleData.get("character1Id"));
        Character character2 = characterService.getCharacterById(battleData.get("character2Id"));

        BattleResult result = battleService.battle(user1, character1, user2, character2);
        return ResponseEntity.ok(result);
    }
}
