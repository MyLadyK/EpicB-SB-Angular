package com.epicbattle.epicb_api.service;

import com.epicbattle.epicb_api.model.BattleResult;
import com.epicbattle.epicb_api.model.Character;
import com.epicbattle.epicb_api.model.User;
import com.epicbattle.epicb_api.model.UserCharacter;
import com.epicbattle.epicb_api.model.SurprisePackage;
import com.epicbattle.epicb_api.repository.BattleResultRepository;

import com.epicbattle.epicb_api.dto.BattleSummary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class BattleService {

    @Autowired
    private BattleResultRepository battleResultRepository;

    @Autowired
    private UserCharacterService userCharacterService;

    @Autowired
    private SurprisePackageService surprisePackageService;

    @Autowired
    private RankingService rankingService;

    /**
     * Realiza una batalla avanzada entre dos personajes de usuario y otorga recompensa al ganador.
     * Lanza IllegalArgumentException si algún personaje de usuario no existe.
     */
    public BattleResult battle(User user1, Character character1, User user2, Character character2, int userCharacter1Id, int userCharacter2Id) {
        UserCharacter uc1 = userCharacterService.getById(userCharacter1Id)
                .orElseThrow(() -> new IllegalArgumentException("UserCharacter1 no encontrado"));
        UserCharacter uc2 = userCharacterService.getById(userCharacter2Id)
                .orElseThrow(() -> new IllegalArgumentException("UserCharacter2 no encontrado"));

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

        // Sumar puntos al ranking del usuario ganador y restar al perdedor
        rankingService.addPointsToUser(winner, 20);

        // Determinar el perdedor y restarle puntos
        User loser = winner.equals(user1) ? user2 : user1;
        rankingService.addPointsToUser(loser, -8);

        return battleResultRepository.save(battleResult);
    }

    /**
     * Simula una batalla y devuelve un resumen detallado de las acciones y el resultado.
     * Lanza IllegalArgumentException si algún personaje de usuario no existe.
     */
    public BattleSummary battleWithSummary(User user1, Character character1, User user2, Character character2, int userCharacter1Id, int userCharacter2Id) {
        UserCharacter uc1 = userCharacterService.getById(userCharacter1Id)
                .orElseThrow(() -> new IllegalArgumentException("UserCharacter1 no encontrado"));
        UserCharacter uc2 = userCharacterService.getById(userCharacter2Id)
                .orElseThrow(() -> new IllegalArgumentException("UserCharacter2 no encontrado"));

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
                events.add(user1.getNameUser() + " ataca a " + user2.getNameUser() + " por " + damage + " de daño");

                // Añadir eventos especiales con probabilidad aleatoria
                if (Math.random() < 0.2) { // 20% de probabilidad de golpe crítico
                    events.add(user1.getNameUser() + " realiza un golpe crítico");
                }
                if (Math.random() < 0.15) { // 15% de probabilidad de habilidad especial
                    events.add(user1.getNameUser() + " usa habilidad especial");
                }
            }
            // Turnos de uc2
            for (int i = 0; i < attacks2 && health1 > 0; i++) {
                double damage = calcularDanio(uc2, uc1);
                health1 -= damage;
                events.add(user2.getNameUser() + " ataca a " + user1.getNameUser() + " por " + damage + " de daño");

                // Añadir eventos especiales con probabilidad aleatoria
                if (Math.random() < 0.2) { // 20% de probabilidad de golpe crítico
                    events.add(user2.getNameUser() + " realiza un golpe crítico");
                }
                if (Math.random() < 0.15) { // 15% de probabilidad de habilidad especial
                    events.add(user2.getNameUser() + " usa habilidad especial");
                }
            }
            round++;
        }

        User winner;
        int winnerUserCharacterId;
        String winnerName;
        if (health1 > health2) {
            winner = user1;
            winnerUserCharacterId = userCharacter1Id;
            winnerName = user1.getNameUser();
        } else {
            winner = user2;
            winnerUserCharacterId = userCharacter2Id;
            winnerName = user2.getNameUser();
        }

        // Otorgar recompensa al personaje ganador
        final String[] surpriseDescription = {null};
        userCharacterService.getById(winnerUserCharacterId).ifPresent(userCharacter -> {
            SurprisePackage surprise = surprisePackageService.getRandomPackage();
            applySurprisePackageToUserCharacter(userCharacter, surprise);
            userCharacterService.save(userCharacter);
            String desc = "¡" + winner.getNameUser() + " recibe un paquete sorpresa: " + surprise.getDescription() + "!";
            events.add(desc);
            surpriseDescription[0] = surprise.getDescription();
        });

        // Sumar puntos al ranking del usuario ganador y restar al perdedor
        int pointsWinner = 20;
        int pointsLoser = -8;
        rankingService.addPointsToUser(winner, pointsWinner);

        // Determinar el perdedor y restarle puntos
        User loser = winner.equals(user1) ? user2 : user1;
        rankingService.addPointsToUser(loser, pointsLoser);

        events.add("¡" + winnerName + " gana la batalla y obtiene un paquete sorpresa!");

        return new BattleSummary(
                winnerName,
                Math.max(0, Math.round(health1 * 10.0) / 10.0),
                Math.max(0, Math.round(health2 * 10.0) / 10.0),
                events,
                surpriseDescription[0],
                pointsWinner
        );
    }

    /**
     * Devuelve el historial de batallas donde el usuario participó (como user1 o user2), ordenadas por fecha descendente.
     */
    public List<BattleResult> getBattlesByUser(int userId) {
        return battleResultRepository.findByUser1_IdUserOrUser2_IdUserOrderByBattleDateDesc(userId, userId);
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
