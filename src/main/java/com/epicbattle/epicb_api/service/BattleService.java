package com.epicbattle.epicb_api.service;

import com.epicbattle.epicb_api.model.BattleResult;
import com.epicbattle.epicb_api.model.Character;
import com.epicbattle.epicb_api.model.User;
import com.epicbattle.epicb_api.model.UserCharacter;
import com.epicbattle.epicb_api.model.SurprisePackage;
import com.epicbattle.epicb_api.model.Ranking;
import com.epicbattle.epicb_api.repository.BattleResultRepository;
import com.epicbattle.epicb_api.service.CharacterService;
import com.epicbattle.epicb_api.service.UserCharacterService;
import com.epicbattle.epicb_api.service.SurprisePackageService;
import com.epicbattle.epicb_api.service.RankingService;
import com.epicbattle.epicb_api.service.UserService;
import com.epicbattle.epicb_api.dto.BattleSummary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class BattleService {

    @Autowired
    private BattleResultRepository battleResultRepository;

    @Autowired
    private CharacterService characterService;

    @Autowired
    private UserService userService;

    @Autowired
    private UserCharacterService userCharacterService;

    @Autowired
    private SurprisePackageService surprisePackageService;

    @Autowired
    private RankingService rankingService;

    /**
     * Realiza una batalla avanzada entre dos personajes de usuario y otorga recompensa al ganador.
     */
    public BattleResult battle(User user1, Character character1, User user2, Character character2, int userCharacter1Id, int userCharacter2Id) {
        UserCharacter uc1 = userCharacterService.getById(userCharacter1Id).orElseThrow(() -> new RuntimeException("UserCharacter1 no encontrado"));
        UserCharacter uc2 = userCharacterService.getById(userCharacter2Id).orElseThrow(() -> new RuntimeException("UserCharacter2 no encontrado"));

        // Clonar salud para simulación (no modificar objeto real)
        double health1 = uc1.getHealthUserCharacter();
        double health2 = uc2.getHealthUserCharacter();

        // Determinar número de ataques por ronda según velocidad
        int attacks1 = (int) Math.max(1, Math.round(uc1.getSpeedUserCharacter() / Math.max(1, uc2.getSpeedUserCharacter())));
        int attacks2 = (int) Math.max(1, Math.round(uc2.getSpeedUserCharacter() / Math.max(1, uc1.getSpeedUserCharacter())));

        // Simulación de combate por rondas
        int round = 1;
        while (health1 > 0 && health2 > 0 && round <= 50) { // límite de rondas para evitar bucles infinitos
            // Turnos de uc1
            for (int i = 0; i < attacks1 && health2 > 0; i++) {
                double damage = calcularDanio(uc1, uc2);
                health2 -= damage;
            }
            // Turnos de uc2
            for (int i = 0; i < attacks2 && health1 > 0; i++) {
                double damage = calcularDanio(uc2, uc1);
                health1 -= damage;
            }
            round++;
        }

        User winner;
        int winnerUserCharacterId;
        if (health1 > health2) {
            winner = user1;
            winnerUserCharacterId = userCharacter1Id;
        } else {
            winner = user2;
            winnerUserCharacterId = userCharacter2Id;
        }

        BattleResult battleResult = new BattleResult();
        battleResult.setUser1(user1);
        battleResult.setUser2(user2);
        battleResult.setWinner(winner);
        battleResult.setBattleDate(new java.util.Date());

        // Otorgar recompensa al personaje ganador
        userCharacterService.getById(winnerUserCharacterId).ifPresent(userCharacter -> {
            SurprisePackage surprise = surprisePackageService.getRandomPackage();
            applySurprisePackageToUserCharacter(userCharacter, surprise);
            userCharacterService.save(userCharacter);
        });

        // Sumar puntos al ranking del usuario ganador
        rankingService.addPointsToUser(winner, 3);

        return battleResultRepository.save(battleResult);
    }

    /**
     * Realiza una batalla avanzada entre dos personajes de usuario y otorga recompensa al ganador.
     * Devuelve el resumen del combate.
     */
    public BattleSummary battleWithSummary(User user1, Character character1, User user2, Character character2, int userCharacter1Id, int userCharacter2Id) {
        UserCharacter uc1 = userCharacterService.getById(userCharacter1Id).orElseThrow(() -> new RuntimeException("UserCharacter1 no encontrado"));
        UserCharacter uc2 = userCharacterService.getById(userCharacter2Id).orElseThrow(() -> new RuntimeException("UserCharacter2 no encontrado"));

        double health1 = uc1.getHealthUserCharacter();
        double health2 = uc2.getHealthUserCharacter();
        int attacks1 = (int) Math.max(1, Math.round(uc1.getSpeedUserCharacter() / Math.max(1, uc2.getSpeedUserCharacter())));
        int attacks2 = (int) Math.max(1, Math.round(uc2.getSpeedUserCharacter() / Math.max(1, uc1.getSpeedUserCharacter())));

        List<String> events = new ArrayList<>();
        int round = 1;
        while (health1 > 0 && health2 > 0 && round <= 50) {
            events.add("--- Ronda " + round + " ---");
            // Turnos de uc1
            for (int i = 0; i < attacks1 && health2 > 0; i++) {
                double damage = calcularDanio(uc1, uc2);
                health2 -= damage;
                events.add(uc1.getBaseCharacter().getNameCharacter() + " ataca a " + uc2.getBaseCharacter().getNameCharacter() + " e inflige " + damage + " de daño. Salud restante: " + Math.max(0, Math.round(health2 * 10.0) / 10.0));
            }
            // Turnos de uc2
            for (int i = 0; i < attacks2 && health1 > 0; i++) {
                double damage = calcularDanio(uc2, uc1);
                health1 -= damage;
                events.add(uc2.getBaseCharacter().getNameCharacter() + " ataca a " + uc1.getBaseCharacter().getNameCharacter() + " e inflige " + damage + " de daño. Salud restante: " + Math.max(0, Math.round(health1 * 10.0) / 10.0));
            }
            round++;
        }

        User winner;
        int winnerUserCharacterId;
        String winnerName;
        if (health1 > health2) {
            winner = user1;
            winnerUserCharacterId = userCharacter1Id;
            winnerName = uc1.getBaseCharacter().getNameCharacter();
        } else {
            winner = user2;
            winnerUserCharacterId = userCharacter2Id;
            winnerName = uc2.getBaseCharacter().getNameCharacter();
        }

        // Otorgar recompensa al personaje ganador
        userCharacterService.getById(winnerUserCharacterId).ifPresent(userCharacter -> {
            SurprisePackage surprise = surprisePackageService.getRandomPackage();
            applySurprisePackageToUserCharacter(userCharacter, surprise);
            userCharacterService.save(userCharacter);
            events.add("¡" + userCharacter.getBaseCharacter().getNameCharacter() + " recibe un paquete sorpresa: " + surprise.getDescription() + "!");
        });

        // Sumar puntos al ranking del usuario ganador
        rankingService.addPointsToUser(winner, 3);
        events.add("¡" + winnerName + " gana la batalla y suma 3 puntos al ranking!");

        return new BattleSummary(
                winnerName,
                Math.max(0, Math.round(health1 * 10.0) / 10.0),
                Math.max(0, Math.round(health2 * 10.0) / 10.0),
                events
        );
    }

    /**
     * Calcula el daño de un ataque considerando ataque, defensa, inteligencia y especial.
     */
    private double calcularDanio(UserCharacter atacante, UserCharacter defensor) {
        // Base: ataque - defensa
        double base = atacante.getAttackUserCharacter() - (defensor.getDefenseUserCharacter() * 0.7);
        base = Math.max(1, base); // Daño mínimo
        // Crítico por inteligencia
        boolean critico = Math.random() < (atacante.getIntelligenceUserCharacter() / 30.0); // máx 33% si inteligencia=10
        if (critico) base *= 1.5;
        // Bonus especial
        boolean especial = Math.random() < (atacante.getSpecialUserCharacter() / 20.0); // máx 25% si especial=5
        if (especial) base *= 1.3;
        // Aguante del defensor reduce daño si es alto
        base *= (1 - (defensor.getStaminaUserCharacter() / 50.0)); // máx -20% si stamina=10
        return Math.round(base * 10.0) / 10.0;
    }

    /**
     * Aplica el paquete sorpresa al personaje de usuario
     */
    private void applySurprisePackageToUserCharacter(UserCharacter userCharacter, SurprisePackage surprise) {
        switch (surprise.getModificationType()) {
            case "attack":
                userCharacter.setAttackUserCharacter(Math.min(userCharacter.getAttackUserCharacter() + surprise.getModificationValue(), 10));
                break;
            case "defense":
                userCharacter.setDefenseUserCharacter(Math.min(userCharacter.getDefenseUserCharacter() + surprise.getModificationValue(), 10));
                break;
            case "speed":
                userCharacter.setSpeedUserCharacter(Math.min(userCharacter.getSpeedUserCharacter() + surprise.getModificationValue(), 10));
                break;
            case "stamina":
                userCharacter.setStaminaUserCharacter(Math.min(userCharacter.getStaminaUserCharacter() + surprise.getModificationValue(), 10));
                break;
            case "intelligence":
                userCharacter.setIntelligenceUserCharacter(Math.min(userCharacter.getIntelligenceUserCharacter() + surprise.getModificationValue(), 10));
                break;
            case "special":
                userCharacter.setSpecialUserCharacter(Math.min(userCharacter.getSpecialUserCharacter() + surprise.getModificationValue(), 5));
                break;
            case "health":
                userCharacter.setHealthUserCharacter(Math.min(userCharacter.getHealthUserCharacter() + surprise.getModificationValue(), 100));
                break;
        }
    }
}
