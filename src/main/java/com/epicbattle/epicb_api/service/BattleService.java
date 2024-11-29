package com.epicbattle.epicb_api.service;

import com.epicbattle.epicb_api.model.BattleResult;
import com.epicbattle.epicb_api.model.Character;
import com.epicbattle.epicb_api.model.User;
import com.epicbattle.epicb_api.repository.BattleResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class BattleService {

    @Autowired
    private BattleResultRepository battleResultRepository;

    @Autowired
    private CharacterService characterService;

    @Autowired
    private UserService userService;

    public BattleResult battle(User user1, Character character1, User user2, Character character2) {
        Character winnerCharacter = character1.getAttackCharacter() > character2.getAttackCharacter() ? character1 : character2;
        User winner = winnerCharacter.equals(character1) ? user1 : user2;

        BattleResult battleResult = new BattleResult();
        battleResult.setUser1(user1);  // Corregido para usar la instancia de `battleResult`
        battleResult.setUser2(user2);  // Corregido para usar la instancia de `battleResult`
        battleResult.setWinner(winner); // Corregido para usar la instancia de `battleResult`
        battleResult.setBattleDate(new Date());

        return battleResultRepository.save(battleResult);
    }

}
