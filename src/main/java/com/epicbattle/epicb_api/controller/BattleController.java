package com.epicbattle.epicb_api.controller;

import com.epicbattle.epicb_api.dto.BattleRequestDTO;
import com.epicbattle.epicb_api.dto.BattleSummary;
import com.epicbattle.epicb_api.model.BattleResult;
import com.epicbattle.epicb_api.model.Character;
import com.epicbattle.epicb_api.model.User;
import com.epicbattle.epicb_api.model.UserCharacter;
import com.epicbattle.epicb_api.repository.UserRepository;
import com.epicbattle.epicb_api.service.BattleResultService;
import com.epicbattle.epicb_api.service.BattleService;
import com.epicbattle.epicb_api.service.CharacterService;
import com.epicbattle.epicb_api.service.UserCharacterService;
import com.epicbattle.epicb_api.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Controlador que maneja todas las operaciones relacionadas con las batallas
 */
@RestController
@RequestMapping("/api/battles")
public class BattleController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private UserCharacterService userCharacterService;

    @Autowired
    private BattleResultService battleResultService;

    @Autowired
    private BattleService battleService;

    @Autowired
    private CharacterService characterService;

    /**
     * Inicia una batalla entre el usuario autenticado y otro usuario seleccionado.
     * Selecciona aleatoriamente un personaje de cada usuario y determina un ganador.
     * El ganador recibe puntos y el perdedor pierde puntos (mínimo 0).
     *
     * @param opponentId ID del usuario oponente
     * @return ResponseEntity con el resultado de la batalla o error si algo falla
     */
    @PostMapping("/start/{opponentId}")
    public ResponseEntity<?> startBattle(@PathVariable int opponentId) {
        // Obtener usuario autenticado
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByNameUser(username);
        
        if (currentUser == null) {
            return ResponseEntity.badRequest().body("Usuario no encontrado");
        }

        // Validar que el oponente existe
        Optional<User> opponentOpt = userRepository.findById(opponentId);
        if (opponentOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Oponente no encontrado");
        }
        User opponent = opponentOpt.get();

        // Validar que no es el mismo usuario
        if (currentUser.getIdUser() == opponent.getIdUser()) {
            return ResponseEntity.badRequest().body("No puedes luchar contra ti mismo");
        }

        try {
            BattleResult result = battleService.executeBattle(currentUser, opponent);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error en la batalla: " + e.getMessage());
        }
    }

    /**
     * Obtiene el historial de batallas de un usuario específico
     *
     * @param userId ID del usuario
     * @return Lista de resultados de batalla del usuario
     */
    @GetMapping("/history/{userId}")
    public ResponseEntity<?> getBattleHistory(@PathVariable int userId) {
        try {
            List<BattleResult> history = battleResultService.getBattleHistoryForUser(userId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al obtener historial: " + e.getMessage());
        }
    }

    /**
     * Obtiene un resumen de las estadísticas de batalla de un usuario
     *
     * @param userId ID del usuario
     * @return Resumen de batallas del usuario
     */
    @GetMapping("/summary/{userId}")
    public ResponseEntity<?> getBattleSummary(@PathVariable int userId) {
        try {
            BattleSummary summary = battleResultService.getBattleSummaryForUser(userId);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al obtener resumen: " + e.getMessage());
        }
    }

    /**
     * Determina el ganador de una batalla entre dos personajes.
     * El algoritmo es simple: se suman todas las estadísticas de cada personaje y se comparan.
     * Se añade un factor aleatorio para hacer las batallas más interesantes.
     */
    private boolean determineWinner(UserCharacter character1, UserCharacter character2) {
        // Calcular la puntuación total de cada personaje
        double score1 = character1.getHealthUserCharacter() +
                        character1.getAttackUserCharacter() * 2 +
                        character1.getDefenseUserCharacter() * 1.5 +
                        character1.getSpeedUserCharacter() +
                        character1.getStaminaUserCharacter() +
                        character1.getIntelligenceUserCharacter() +
                        character1.getSpecialUserCharacter() * 3;

        double score2 = character2.getHealthUserCharacter() +
                        character2.getAttackUserCharacter() * 2 +
                        character2.getDefenseUserCharacter() * 1.5 +
                        character2.getSpeedUserCharacter() +
                        character2.getStaminaUserCharacter() +
                        character2.getIntelligenceUserCharacter() +
                        character2.getSpecialUserCharacter() * 3;

        // Añadir un factor aleatorio (±20%)
        Random random = new Random();
        double randomFactor1 = 0.8 + (random.nextDouble() * 0.4); // Entre 0.8 y 1.2
        double randomFactor2 = 0.8 + (random.nextDouble() * 0.4); // Entre 0.8 y 1.2

        score1 *= randomFactor1;
        score2 *= randomFactor2;

        // El personaje con mayor puntuación gana
        return score1 > score2;
    }

    /**
     * Obtiene los resultados de las batallas del usuario autenticado.
     */
    @GetMapping("/results")
    public ResponseEntity<?> getBattleResults() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByNameUser(username);
        if (currentUser == null) {
            currentUser = userRepository.findByMailUser(username);
        }
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Usuario no autenticado"));
        }

        // Obtener todas las batallas donde el usuario participó
        List<BattleResult> allBattles = battleResultService.getAllBattleResults();
        final int userId = currentUser.getIdUser(); // Make effectively final for lambda
        List<BattleResult> userBattles = allBattles.stream()
            .filter(battle -> 
                battle.getUser1().getIdUser() == userId || 
                battle.getUser2().getIdUser() == userId)
            .toList();



        return ResponseEntity.ok(userBattles);
    }

    /**
     * Obtiene los resultados de las batallas de un usuario específico.
     * @param userId ID del usuario
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getBattlesByUser(@PathVariable int userId) {
        try {
            // Verificar que el usuario existe
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Usuario no encontrado"));
            }

            // Obtener todas las batallas donde el usuario participó
            List<BattleResult> allBattles = battleResultService.getAllBattleResults();
            List<BattleResult> userBattles = allBattles.stream()
                .filter(battle -> 
                    battle.getUser1().getIdUser() == userId || 
                    battle.getUser2().getIdUser() == userId)
                .peek(battle -> {
                    // Establecer el nombre del oponente si no está establecido
                    if (battle.getOpponentName() == null || battle.getOpponentName().isEmpty()) {
                        User opponent = battle.getUser1().getIdUser() == userId ? battle.getUser2() : battle.getUser1();
                        battle.setOpponentName(opponent.getNameUser());
                    }
                    // Establecer el resultado si no está establecido
                    if (battle.getResult() == null || battle.getResult().isEmpty()) {
                        boolean isWinner = battle.getWinner().getIdUser() == userId;
                        battle.setResult(isWinner ? "WIN" : "LOSE");
                    }
                    // Establecer los puntos si no están establecidos
                    if (battle.getBattlePoints() == 0) {
                        boolean isWinner = battle.getWinner().getIdUser() == userId;
                        battle.setBattlePoints(isWinner ? 20 : -8);
                    }
                })
                .sorted((b1, b2) -> b2.getBattleDate().compareTo(b1.getBattleDate()))
                .toList();

            return ResponseEntity.ok(userBattles);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error al obtener las batallas: " + e.getMessage()));
        }
    }

    /**
     * Endpoint para realizar una batalla entre dos personajes.
     * @param battleRequest Datos de la batalla (user1Id, user2Id, character1Id, character2Id)
     * @return Resultado de la batalla
     */
    @PostMapping("/fight")
    public ResponseEntity<?> fight(@RequestBody BattleRequestDTO battleRequest) {
        try {
            // Obtener usuarios
            User user1 = userService.getUserById(battleRequest.getUser1Id()).orElseThrow(
                    () -> new IllegalArgumentException("Usuario 1 no encontrado"));
            User user2 = userService.getUserById(battleRequest.getUser2Id()).orElseThrow(
                    () -> new IllegalArgumentException("Usuario 2 no encontrado"));

            // Obtener UserCharacter objetos
            UserCharacter userCharacter1 = userCharacterService.getById(battleRequest.getUserCharacter1Id())
                    .orElseThrow(() -> new IllegalArgumentException("Personaje del usuario 1 no encontrado"));
            UserCharacter userCharacter2 = userCharacterService.getById(battleRequest.getUserCharacter2Id())
                    .orElseThrow(() -> new IllegalArgumentException("Personaje del usuario 2 no encontrado"));

            // Verificar que los personajes pertenecen a los usuarios correctos
            if (userCharacter1.getOwner().getIdUser() != user1.getIdUser()) {
                throw new IllegalArgumentException("El personaje 1 no pertenece al usuario 1");
            }
            if (userCharacter2.getOwner().getIdUser() != user2.getIdUser()) {
                throw new IllegalArgumentException("El personaje 2 no pertenece al usuario 2");
            }

            // Validaciones adicionales del estado de los personajes
            if (userCharacter1.getHealthUserCharacter() <= 0) {
                throw new IllegalArgumentException("El personaje 1 no tiene salud suficiente para batallar");
            }
            if (userCharacter2.getHealthUserCharacter() <= 0) {
                throw new IllegalArgumentException("El personaje 2 no tiene salud suficiente para batallar");
            }

            // Verificar que los personajes no están en otra batalla activa
            if (userCharacter1.getTimesUsed() > 100) {
                throw new IllegalArgumentException("El personaje 1 necesita descansar antes de otra batalla");
            }
            if (userCharacter2.getTimesUsed() > 100) {
                throw new IllegalArgumentException("El personaje 2 necesita descansar antes de otra batalla");
            }

            // Realizar la batalla usando el servicio
            BattleResult result = battleService.battle(
                    user1, userCharacter1,
                    user2, userCharacter2,
                    battleRequest.getUserCharacter1Id(),
                    battleRequest.getUserCharacter2Id());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace(); // Para ver el error en los logs
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Endpoint para realizar una batalla con resumen detallado.
     * @param battleRequest Datos de la batalla (user1Id, user2Id, character1Id, character2Id)
     * @return Resumen detallado de la batalla
     */
    @PostMapping("/fight/summary")
    public ResponseEntity<?> fightSummary(@RequestBody BattleRequestDTO battleRequest) {
        try {
            // Obtener usuarios
            User user1 = userService.getUserById(battleRequest.getUser1Id()).orElseThrow(
                    () -> new IllegalArgumentException("Usuario 1 no encontrado"));
            User user2 = userService.getUserById(battleRequest.getUser2Id()).orElseThrow(
                    () -> new IllegalArgumentException("Usuario 2 no encontrado"));

            // Obtener UserCharacter objetos
            UserCharacter userCharacter1 = userCharacterService.getById(battleRequest.getUserCharacter1Id())
                    .orElseThrow(() -> new IllegalArgumentException("Personaje del usuario 1 no encontrado"));
            UserCharacter userCharacter2 = userCharacterService.getById(battleRequest.getUserCharacter2Id())
                    .orElseThrow(() -> new IllegalArgumentException("Personaje del usuario 2 no encontrado"));

            // Verificar que los personajes pertenecen a los usuarios correctos
            if (userCharacter1.getOwner().getIdUser() != user1.getIdUser()) {
                throw new IllegalArgumentException("El personaje 1 no pertenece al usuario 1");
            }
            if (userCharacter2.getOwner().getIdUser() != user2.getIdUser()) {
                throw new IllegalArgumentException("El personaje 2 no pertenece al usuario 2");
            }

            // Validaciones adicionales del estado de los personajes
            if (userCharacter1.getHealthUserCharacter() <= 0) {
                throw new IllegalArgumentException("El personaje 1 no tiene salud suficiente para batallar");
            }
            if (userCharacter2.getHealthUserCharacter() <= 0) {
                throw new IllegalArgumentException("El personaje 2 no tiene salud suficiente para batallar");
            }

            // Verificar que los personajes no están en otra batalla activa
            if (userCharacter1.getTimesUsed() > 100) {
                throw new IllegalArgumentException("El personaje 1 necesita descansar antes de otra batalla");
            }
            if (userCharacter2.getTimesUsed() > 100) {
                throw new IllegalArgumentException("El personaje 2 necesita descansar antes de otra batalla");
            }

            // Realizar la batalla con resumen
            BattleSummary summary = battleService.battleWithSummary(
                    user1, userCharacter1,
                    user2, userCharacter2, 
                    battleRequest.getUserCharacter1Id(), battleRequest.getUserCharacter2Id());

            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }


    /**
     * Transforma la URL de la imagen de un UserCharacter para que apunte al servidor backend.
     * @param userCharacter El UserCharacter cuya URL de imagen se transformará
     */
    private void transformImageUrl(UserCharacter userCharacter) {
        if (userCharacter != null && userCharacter.getImageUrlUserCharacter() != null) {
            String imageUrl = userCharacter.getImageUrlUserCharacter();
            if (!imageUrl.startsWith("http")) {
                String fullImageUrl = "http://localhost:8081" + imageUrl;
                userCharacter.setImageUrlUserCharacter(fullImageUrl);
            }
        }
    }
}
