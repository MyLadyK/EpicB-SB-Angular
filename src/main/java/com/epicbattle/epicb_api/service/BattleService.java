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

    @Autowired
    private UserService userService;

    /**
     * Realiza una batalla avanzada entre dos personajes de usuario y otorga recompensa al ganador.
     * Lanza IllegalArgumentException si algún personaje de usuario no existe.
     */
    public BattleResult battle(User user1, UserCharacter uc1, User user2, UserCharacter uc2, int userCharacter1Id, int userCharacter2Id) {
        // Clonar salud para simulación
        double health1 = uc1.getHealthUserCharacter();
        double health2 = uc2.getHealthUserCharacter();

        // Calcular velocidad relativa y ataques por turno
        double speedRatio1 = uc1.getSpeedUserCharacter() / Math.max(1, uc2.getSpeedUserCharacter());
        double speedRatio2 = uc2.getSpeedUserCharacter() / Math.max(1, uc1.getSpeedUserCharacter());
        
        // Probabilidad de ataque extra basada en la velocidad
        double extraAttackChance1 = Math.min(0.5, speedRatio1 - 1);
        double extraAttackChance2 = Math.min(0.5, speedRatio2 - 1);

        List<BattleEvent> events = new ArrayList<>();
        int round = 1;
        String surpriseDesc = null;
        SurprisePackage surprisePackage = null;
        User winner = null;
        UserCharacter winnerCharacter = null;

        // Simulación de combate por rondas
        while (health1 > 0 && health2 > 0 && round <= 50) {
            events.add(new BattleEvent(
                BattleEvent.Target.character1,
                0,
                null,
                null,
                "=== Ronda " + round + " ==="
            ));

            // Ataques del personaje 1
            int attacks1 = 1;
            if (Math.random() < extraAttackChance1) attacks1++;
            
            for (int i = 0; i < attacks1 && health2 > 0; i++) {
                // Calcular efectos especiales y daño
                double baseDamage = uc1.getAttackUserCharacter();
                double defenseFactor = Math.max(0.2, 1 - (uc2.getDefenseUserCharacter() / 25.0));
                double criticalChance = (uc1.getSpeedUserCharacter() + uc1.getIntelligenceUserCharacter()) / 200.0;
                boolean isCritical = Math.random() < criticalChance;
                double intelligenceBonus = 1.0 + (uc1.getIntelligenceUserCharacter() / 100.0);
                double staminaFactor = 0.7 + (uc1.getStaminaUserCharacter() / 100.0);
                
                // Habilidad especial
                boolean specialActivated = false;
                double specialMultiplier = 1.0;
                if (uc1.getSpecialUserCharacter() > 0) {
                    double specialChance = uc1.getSpecialUserCharacter() / 200.0;
                    specialActivated = Math.random() < specialChance;
                    if (specialActivated) {
                        specialMultiplier = 1.0 + (uc1.getSpecialUserCharacter() / 50.0);
                    }
                }

                // Calcular daño final
                double damage = baseDamage * defenseFactor * intelligenceBonus * staminaFactor;
                if (isCritical) damage *= 1.5;
                if (specialActivated) damage *= specialMultiplier;
                double randomFactor = 0.8 + (Math.random() * 0.4);
                damage *= randomFactor;
                damage = Math.max(0.5, damage);
                
                // Aplicar daño
                health2 = Math.max(0, health2 - damage);
                
                // Construir mensaje descriptivo
                StringBuilder description = new StringBuilder();
                
                if (attacks1 > 1 && i == 1) {
                    description.append("¡Ataque extra por velocidad! ");
                }
                
                description.append(String.format("%s ataca a %s", 
                    uc1.getBaseCharacter().getNameCharacter(),
                    uc2.getBaseCharacter().getNameCharacter()));
                
                if (isCritical) {
                    description.append(" ¡GOLPE CRÍTICO!");
                }
                
                if (specialActivated) {
                    description.append(String.format(" ¡HABILIDAD ESPECIAL ACTIVADA (x%.1f)!", specialMultiplier));
                }
                
                if (intelligenceBonus > 1.2) {
                    description.append(" ¡Ataque calculado con precisión!");
                }
                
                if (staminaFactor > 0.9) {
                    description.append(" ¡Golpe potente!");
                }
                
                description.append(String.format(" (%.1f de daño)", damage));
                
                events.add(new BattleEvent(
                    BattleEvent.Target.character2,
                    damage,
                    uc1,
                    uc2,
                    description.toString()
                ));
            }

            // Ataques del personaje 2 (si aún está vivo)
            if (health2 > 0) {
                int attacks2 = 1;
                if (Math.random() < extraAttackChance2) attacks2++;
                
                for (int i = 0; i < attacks2 && health1 > 0; i++) {
                    // Calcular efectos especiales y daño
                    double baseDamage = uc2.getAttackUserCharacter();
                    double defenseFactor = Math.max(0.2, 1 - (uc1.getDefenseUserCharacter() / 25.0));
                    double criticalChance = (uc2.getSpeedUserCharacter() + uc2.getIntelligenceUserCharacter()) / 200.0;
                    boolean isCritical = Math.random() < criticalChance;
                    double intelligenceBonus = 1.0 + (uc2.getIntelligenceUserCharacter() / 100.0);
                    double staminaFactor = 0.7 + (uc2.getStaminaUserCharacter() / 100.0);
                    
                    // Habilidad especial
                    boolean specialActivated = false;
                    double specialMultiplier = 1.0;
                    if (uc2.getSpecialUserCharacter() > 0) {
                        double specialChance = uc2.getSpecialUserCharacter() / 200.0;
                        specialActivated = Math.random() < specialChance;
                        if (specialActivated) {
                            specialMultiplier = 1.0 + (uc2.getSpecialUserCharacter() / 50.0);
                        }
                    }

                    // Calcular daño final
                    double damage = baseDamage * defenseFactor * intelligenceBonus * staminaFactor;
                    if (isCritical) damage *= 1.5;
                    if (specialActivated) damage *= specialMultiplier;
                    double randomFactor = 0.8 + (Math.random() * 0.4);
                    damage *= randomFactor;
                    damage = Math.max(0.5, damage);
                    
                    // Aplicar daño
                    health1 = Math.max(0, health1 - damage);
                    
                    // Construir mensaje descriptivo
                    StringBuilder description = new StringBuilder();
                    
                    if (attacks2 > 1 && i == 1) {
                        description.append("¡Ataque extra por velocidad! ");
                    }
                    
                    description.append(String.format("%s ataca a %s", 
                        uc2.getBaseCharacter().getNameCharacter(),
                        uc1.getBaseCharacter().getNameCharacter()));
                    
                    if (isCritical) {
                        description.append(" ¡GOLPE CRÍTICO!");
                    }
                    
                    if (specialActivated) {
                        description.append(String.format(" ¡HABILIDAD ESPECIAL ACTIVADA (x%.1f)!", specialMultiplier));
                    }
                    
                    if (intelligenceBonus > 1.2) {
                        description.append(" ¡Ataque calculado con precisión!");
                    }
                    
                    if (staminaFactor > 0.9) {
                        description.append(" ¡Golpe potente!");
                    }
                    
                    description.append(String.format(" (%.1f de daño)", damage));
                    
                    events.add(new BattleEvent(
                        BattleEvent.Target.character1,
                        damage,
                        uc2,
                        uc1,
                        description.toString()
                    ));
                }
            }

            round++;
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
                String.format("¡Victoria para %s! Salud restante: %.1f", 
                    user1.getNameUser(), health1)
            ));
        } else {
            winner = user2;
            winnerCharacter = uc2;
            events.add(new BattleEvent(
                BattleEvent.Target.character2,
                0,
                uc2,
                uc1,
                String.format("¡Victoria para %s! Salud restante: %.1f", 
                    user2.getNameUser(), health2)
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
            System.err.println("Error al aplicar paquete sorpresa: " + e.getMessage());
            surpriseDesc = "No se pudo aplicar el paquete sorpresa";
        }

        // Incrementar veces usado
        uc1.setTimesUsed(uc1.getTimesUsed() + 1);
        uc2.setTimesUsed(uc2.getTimesUsed() + 1);
        userCharacterService.save(uc1);
        userCharacterService.save(uc2);

        // Actualizar puntos en el ranking y en los usuarios
        int pointsWinner = 20;
        int pointsLoser = -8;
        
        // Actualizar puntos del ganador
        winner.setPointsUser(winner.getPointsUser() + pointsWinner);
        rankingService.addPointsToUser(winner, pointsWinner);
        
        // Actualizar puntos del perdedor
        User loser = winner.equals(user1) ? user2 : user1;
        loser.setPointsUser(Math.max(0, loser.getPointsUser() + pointsLoser));
        rankingService.addPointsToUser(loser, pointsLoser);

        // Guardar los cambios en los usuarios
        userService.save(winner);
        userService.save(loser);

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
            e.printStackTrace();
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
     * Obtiene todas las batallas de un usuario específico
     * @param userId ID del usuario
     * @return Lista de resultados de batalla
     */
    public List<BattleResult> getBattlesByUser(int userId) {
        return battleResultRepository.findUserBattles(userId);
    }

    /**
     * Obtiene todas las batallas ganadas por un usuario
     * @param userId ID del usuario
     * @return Lista de resultados de batalla ganadas
     */
    public List<BattleResult> getWonBattles(int userId) {
        return battleResultRepository.findWonBattles(userId);
    }

    /**
     * Calcula el daño de un ataque considerando todos los atributos del personaje.
     */
    private double calculateDamage(UserCharacter atacante, UserCharacter defensor) {
        // 1. Daño base basado en el ataque
        double baseDamage = atacante.getAttackUserCharacter();
        
        // 2. Factor de defensa mejorado
        double defenseFactor = Math.max(0.2, 1 - (defensor.getDefenseUserCharacter() / 25.0));
        
        // 3. Probabilidad y daño de golpe crítico basado en velocidad e inteligencia
        double criticalChance = (atacante.getSpeedUserCharacter() + atacante.getIntelligenceUserCharacter()) / 200.0;
        boolean isCritical = Math.random() < criticalChance;
        
        // 4. Bonificación por inteligencia (mejora la precisión y reduce la defensa enemiga)
        double intelligenceBonus = 1.0 + (atacante.getIntelligenceUserCharacter() / 100.0);
        defenseFactor *= (1 + (atacante.getIntelligenceUserCharacter() / 150.0));
        
        // 5. Factor de stamina (afecta la consistencia del daño)
        double staminaFactor = 0.7 + (atacante.getStaminaUserCharacter() / 100.0);
        
        // 6. Habilidad especial
        boolean specialActivated = false;
        double specialMultiplier = 1.0;
        if (atacante.getSpecialUserCharacter() > 0) {
            // Probabilidad de activar especial basada en el valor del atributo
            double specialChance = atacante.getSpecialUserCharacter() / 200.0;
            specialActivated = Math.random() < specialChance;
            if (specialActivated) {
                // El multiplicador depende del valor del atributo especial
                specialMultiplier = 1.0 + (atacante.getSpecialUserCharacter() / 50.0);
            }
        }
        
        // 7. Calcular daño final
        double damage = baseDamage * defenseFactor * intelligenceBonus * staminaFactor;
        
        // Aplicar crítico si corresponde
        if (isCritical) {
            damage *= 1.5;
        }
        
        // Aplicar especial si se activó
        if (specialActivated) {
            damage *= specialMultiplier;
        }
        
        // 8. Añadir variación aleatoria (±20%)
        double randomFactor = 0.8 + (Math.random() * 0.4);
        damage *= randomFactor;
        
        // 9. Asegurar daño mínimo
        return Math.max(0.5, damage);
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
