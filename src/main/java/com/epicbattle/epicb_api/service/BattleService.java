package com.epicbattle.epicb_api.service;

import com.epicbattle.epicb_api.model.BattleResult;
import com.epicbattle.epicb_api.model.BattleEvent;
import com.epicbattle.epicb_api.model.Character;
import com.epicbattle.epicb_api.model.User;
import com.epicbattle.epicb_api.model.UserCharacter;
import com.epicbattle.epicb_api.model.SurprisePackage;
import com.epicbattle.epicb_api.repository.BattleResultRepository;

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
    private UserCharacterService userCharacterService;

    @Autowired
    private SurprisePackageService surprisePackageService;

    @Autowired
    private RankingService rankingService;

    /**
     * Realiza una batalla avanzada entre dos personajes de usuario y otorga recompensa al ganador.
     * Lanza IllegalArgumentException si algún personaje de usuario no existe.
     */
    public BattleResult battle(User user1, UserCharacter uc1, User user2, UserCharacter uc2, int userCharacter1Id, int userCharacter2Id) {
        // Clonar salud para simulación (no modificar objeto real)
        double health1 = uc1.getHealthUserCharacter();
        double health2 = uc2.getHealthUserCharacter();

        // Determinar número de ataques por ronda según velocidad
        int attacks1 = (int) Math.max(1, Math.round(uc1.getSpeedUserCharacter() / Math.max(1, uc2.getSpeedUserCharacter())));
        int attacks2 = (int) Math.max(1, Math.round(uc2.getSpeedUserCharacter() / Math.max(1, uc1.getSpeedUserCharacter())));

        List<BattleEvent> events = new ArrayList<>();
        int round = 1;
        String surpriseDesc = null;
        SurprisePackage surprisePackage = null;
        User winner = null;
        UserCharacter winnerCharacter = null;

        // Simulación de combate por rondas
        while (health1 > 0 && health2 > 0) {
            // Ataques del personaje 1
            for (int i = 0; i < attacks1 && health2 > 0; i++) {
                double damage = calculateDamage(uc1, uc2);
                health2 = Math.max(0, health2 - damage);
                BattleEvent event = new BattleEvent(
                    BattleEvent.Target.character2,
                    damage,
                    uc1,
                    uc2,
                    String.format("El personaje de %s ataca causando %.1f de daño", user1.getNameUser(), damage)
                );
                events.add(event);
            }

            // Ataques del personaje 2
            for (int i = 0; i < attacks2 && health1 > 0; i++) {
                double damage = calculateDamage(uc2, uc1);
                health1 = Math.max(0, health1 - damage);
                BattleEvent event = new BattleEvent(
                    BattleEvent.Target.character1,
                    damage,
                    uc2,
                    uc1,
                    String.format("El personaje de %s ataca causando %.1f de daño", user2.getNameUser(), damage)
                );
                events.add(event);
            }

            round++;
            if (round > 50) break; // Límite de seguridad
        }

        // Determinar ganador
        if (health1 > health2) {
            winner = user1;
            winnerCharacter = uc1;
            events.add(new BattleEvent(
                BattleEvent.Target.character1,
                0,
                uc1,
                uc2,
                "¡Victoria para " + user1.getNameUser() + "!"
            ));
        } else {
            winner = user2;
            winnerCharacter = uc2;
            events.add(new BattleEvent(
                BattleEvent.Target.character2,
                0,
                uc2,
                uc1,
                "¡Victoria para " + user2.getNameUser() + "!"
            ));
        }

        // Aplicar paquete sorpresa al ganador
        try {
            surprisePackage = surprisePackageService.getRandomSurprisePackage();
            if (surprisePackage != null) {
                surprisePackageService.applyPackageToCharacter(winnerCharacter, surprisePackage);
                surpriseDesc = String.format("¡%s ha ganado un paquete sorpresa! %s", 
                    winner.getNameUser(), surprisePackage.getDescription());
                events.add(new BattleEvent(
                    winner.equals(user1) ? BattleEvent.Target.character1 : BattleEvent.Target.character2,
                    0,
                    winnerCharacter,
                    winner.equals(user1) ? uc2 : uc1,
                    surpriseDesc
                ));
                
                // Guardar el personaje actualizado
                userCharacterService.save(winnerCharacter);
            }
        } catch (Exception e) {
            // Log el error pero permite que la batalla continúe
            System.err.println("Error al aplicar paquete sorpresa: " + e.getMessage());
            surpriseDesc = "No se pudo aplicar el paquete sorpresa";
        }

        // Incrementar veces usado
        uc1.setTimesUsed(uc1.getTimesUsed() + 1);
        uc2.setTimesUsed(uc2.getTimesUsed() + 1);
        userCharacterService.save(uc1);
        userCharacterService.save(uc2);

        // Actualizar ranking
        rankingService.updateRanking(user1);
        rankingService.updateRanking(user2);

        // Crear y guardar el resultado de la batalla
        BattleResult battleResult = new BattleResult();
        battleResult.setUser1(user1);
        battleResult.setUser2(user2);
        battleResult.setWinner(winner);
        battleResult.setBattleDate(new Date());
        battleResult.setEvents(events);
        
        // Establecer los campos transient
        boolean isUser1Winner = winner.equals(user1);
        battleResult.setTransientFields(
            health1,  // Salud final del personaje 1
            health2,  // Salud final del personaje 2
            isUser1Winner ? user2.getNameUser() : user1.getNameUser(),  // Nombre del oponente
            isUser1Winner,  // Si user1 es el ganador
            surpriseDesc   // Descripción del paquete sorpresa
        );

        // Guardar el resultado y manejar posibles errores
        try {
            // Asegurarse de que las referencias a los usuarios están establecidas correctamente
            battleResult.setUser1(user1);
            battleResult.setUser2(user2);
            battleResult.setWinner(winner);
            
            // Limpiar referencias transient de los eventos antes de guardar
            for (BattleEvent event : events) {
                event.setAttacker(null);
                event.setDefender(null);
            }
            battleResult.setEvents(events);
            
            // Guardar el resultado
            BattleResult savedResult = battleResultRepository.save(battleResult);
            
            // Recargar el resultado completo con todas sus relaciones
            return battleResultRepository.findById(savedResult.getIdBattleResult())
                .orElseThrow(() -> new RuntimeException("Error al recuperar el resultado de la batalla guardado"));
        } catch (Exception e) {
            e.printStackTrace(); // Para ver el error en los logs
            throw new RuntimeException("Error al guardar el resultado de la batalla: " + e.getMessage(), e);
        }
    }

    /**
     * Simula una batalla y devuelve un resumen detallado de las acciones y el resultado.
     * Lanza IllegalArgumentException si algún personaje de usuario no existe.
     */
    public BattleSummary battleWithSummary(User user1, UserCharacter uc1, User user2, UserCharacter uc2, int userCharacter1Id, int userCharacter2Id) {
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
                double damage = calculateDamage(uc1, uc2);
                health2 = Math.max(0, health2 - damage);
                events.add(String.format("El personaje de %s ataca causando %.1f de daño",
                    user1.getNameUser(),
                    damage));

                // Añadir eventos especiales con probabilidad aleatoria
                if (Math.random() < 0.2) { // 20% de probabilidad de golpe crítico
                    events.add("¡" + user1.getNameUser() + " realiza un golpe crítico!");
                }
                if (Math.random() < 0.15) { // 15% de probabilidad de habilidad especial
                    events.add("¡" + user1.getNameUser() + " usa una habilidad especial!");
                }
            }
            // Turnos de uc2
            for (int i = 0; i < attacks2 && health1 > 0; i++) {
                double damage = calculateDamage(uc2, uc1);
                health1 = Math.max(0, health1 - damage);
                events.add(String.format("El personaje de %s ataca causando %.1f de daño",
                    user2.getNameUser(),
                    damage));

                // Añadir eventos especiales con probabilidad aleatoria
                if (Math.random() < 0.2) { // 20% de probabilidad de golpe crítico
                    events.add("¡" + user2.getNameUser() + " realiza un golpe crítico!");
                }
                if (Math.random() < 0.15) { // 15% de probabilidad de habilidad especial
                    events.add("¡" + user2.getNameUser() + " usa una habilidad especial!");
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
            SurprisePackage surprise = surprisePackageService.getRandomSurprisePackage();
            if (surprise != null) {
                surprisePackageService.applyPackageToCharacter(userCharacter, surprise);
                String desc = "¡" + winner.getNameUser() + " recibe un paquete sorpresa: " + surprise.getDescription() + "!";
                events.add(desc);
                surpriseDescription[0] = surprise.getDescription();
            }
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
    private double calculateDamage(UserCharacter atacante, UserCharacter defensor) {
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
                userCharacter.setAttackUserCharacter(userCharacter.getAttackUserCharacter() + surprise.getModificationValue());
                break;
            case "defense":
                userCharacter.setDefenseUserCharacter(userCharacter.getDefenseUserCharacter() + surprise.getModificationValue());
                break;
            case "speed":
                userCharacter.setSpeedUserCharacter(userCharacter.getSpeedUserCharacter() + surprise.getModificationValue());
                break;
            case "stamina":
                userCharacter.setStaminaUserCharacter(userCharacter.getStaminaUserCharacter() + surprise.getModificationValue());
                break;
            case "intelligence":
                userCharacter.setIntelligenceUserCharacter(userCharacter.getIntelligenceUserCharacter() + surprise.getModificationValue());
                break;
            case "special":
                userCharacter.setSpecialUserCharacter(userCharacter.getSpecialUserCharacter() + surprise.getModificationValue());
                break;
            case "health":
                userCharacter.setHealthUserCharacter(userCharacter.getHealthUserCharacter() + surprise.getModificationValue());
                break;
        }
    }
}
