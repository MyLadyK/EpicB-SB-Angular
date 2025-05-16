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
     * El ganador recibe 20 puntos y el perdedor pierde 8 puntos (mínimo 0).
     */
    @PostMapping("/start/{opponentId}")
    public ResponseEntity<?> startBattle(@PathVariable int opponentId) {
        // Obtener el usuario autenticado
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByNameUser(username);
        if (currentUser == null) {
            currentUser = userRepository.findByMailUser(username);
        }
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Usuario no autenticado"));
        }

        // Obtener el oponente
        Optional<User> opponentOpt = userRepository.findById(opponentId);
        if (opponentOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Oponente no encontrado"));
        }
        User opponent = opponentOpt.get();

        // Verificar que no se está enfrentando a sí mismo
        if (currentUser.getIdUser() == opponent.getIdUser()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No puedes enfrentarte a ti mismo"));
        }

        // Obtener los personajes de ambos usuarios
        List<UserCharacter> currentUserCharacters = userCharacterService.findByOwner(currentUser);
        List<UserCharacter> opponentCharacters = userCharacterService.findByOwner(opponent);

        // Verificar que ambos usuarios tienen personajes
        if (currentUserCharacters.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No tienes personajes para batallar"));
        }
        if (opponentCharacters.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El oponente no tiene personajes para batallar"));
        }

        // Seleccionar aleatoriamente un personaje de cada usuario
        Random random = new Random();
        UserCharacter currentUserCharacter = currentUserCharacters.get(random.nextInt(currentUserCharacters.size()));
        UserCharacter opponentCharacter = opponentCharacters.get(random.nextInt(opponentCharacters.size()));

        // Determinar el ganador basado en las estadísticas de los personajes
        boolean currentUserWins = determineWinner(currentUserCharacter, opponentCharacter);

        // Actualizar los puntos de los usuarios
        if (currentUserWins) {
            // El usuario actual gana
            currentUser.setPointsUser(currentUser.getPointsUser() + 20);
            // El oponente pierde puntos pero no puede tener menos de 0
            opponent.setPointsUser(Math.max(0, opponent.getPointsUser() - 8));
        } else {
            // El oponente gana
            opponent.setPointsUser(opponent.getPointsUser() + 20);
            // El usuario actual pierde puntos pero no puede tener menos de 0
            currentUser.setPointsUser(Math.max(0, currentUser.getPointsUser() - 8));
        }

        // Guardar los cambios en los usuarios
        userRepository.save(currentUser);
        userRepository.save(opponent);

        // Crear y guardar el resultado de la batalla
        BattleResult battleResult = new BattleResult();
        battleResult.setUser1(currentUser);
        battleResult.setUser2(opponent);
        battleResult.setWinner(currentUserWins ? currentUser : opponent);
        battleResult.setBattleDate(new Date());
        // Guardar el resultado de la batalla
        battleResultService.saveBattleResult(battleResult);

        // Transformar las URLs de las imágenes para que apunten al servidor backend
        transformImageUrl(currentUserCharacter);
        transformImageUrl(opponentCharacter);

        // Preparar la respuesta
        Map<String, Object> response = new HashMap<>();
        response.put("winner", currentUserWins ? currentUser.getNameUser() : opponent.getNameUser());
        response.put("currentUserCharacter", currentUserCharacter);
        response.put("opponentCharacter", opponentCharacter);
        response.put("currentUserPoints", currentUser.getPointsUser());
        response.put("opponentPoints", opponent.getPointsUser());

        return ResponseEntity.ok(response);
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

        // Transformar las URLs de las imágenes de los personajes en las batallas
        for (BattleResult battle : userBattles) {
            // Aquí se podrían transformar las URLs de las imágenes si las batallas contienen referencias a personajes
            // Por ahora, no hacemos nada ya que BattleResult no contiene directamente UserCharacter
        }

        return ResponseEntity.ok(userBattles);
    }

    /**
     * Obtiene los resultados de las batallas de un usuario específico.
     * @param userId ID del usuario
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getBattlesByUser(@PathVariable int userId) {
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
            .toList();

        // Transformar las URLs de las imágenes de los personajes en las batallas
        for (BattleResult battle : userBattles) {
            // Aquí se podrían transformar las URLs de las imágenes si las batallas contienen referencias a personajes
            // Por ahora, no hacemos nada ya que BattleResult no contiene directamente UserCharacter
        }

        return ResponseEntity.ok(userBattles);
    }

    /**
     * Endpoint para realizar una batalla entre dos personajes.
     * @param battleRequest Datos de la batalla (user1Id, user2Id, character1Id, character2Id)
     * @return Resultado de la batalla
     */
    @PostMapping("/fight")
    public ResponseEntity<?> fight(@RequestBody BattleRequestDTO battleRequest) {
        try {
            // Obtener usuarios y personajes
            User user1 = userService.getUserById(battleRequest.getUser1Id()).orElseThrow(
                    () -> new IllegalArgumentException("Usuario 1 no encontrado"));
            User user2 = userService.getUserById(battleRequest.getUser2Id()).orElseThrow(
                    () -> new IllegalArgumentException("Usuario 2 no encontrado"));
            Character character1 = characterService.getCharacterById(battleRequest.getCharacter1Id());
            Character character2 = characterService.getCharacterById(battleRequest.getCharacter2Id());

            // Realizar la batalla
            BattleResult result = battleService.battle(
                    user1, character1, user2, character2, 
                    battleRequest.getUserCharacter1Id(), battleRequest.getUserCharacter2Id());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
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
            // Obtener usuarios y personajes
            User user1 = userService.getUserById(battleRequest.getUser1Id()).orElseThrow(
                    () -> new IllegalArgumentException("Usuario 1 no encontrado"));
            User user2 = userService.getUserById(battleRequest.getUser2Id()).orElseThrow(
                    () -> new IllegalArgumentException("Usuario 2 no encontrado"));
            Character character1 = characterService.getCharacterById(battleRequest.getCharacter1Id());
            Character character2 = characterService.getCharacterById(battleRequest.getCharacter2Id());

            // Realizar la batalla con resumen
            BattleSummary summary = battleService.battleWithSummary(
                    user1, character1, user2, character2, 
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
            // Si la URL comienza con "/assets", añadir el prefijo del servidor backend
            if (imageUrl.startsWith("/assets")) {
                // Usar "http://localhost:8081" como prefijo para el servidor backend
                String backendUrl = "http://localhost:8081";
                String fullImageUrl = backendUrl + imageUrl;
                userCharacter.setImageUrlUserCharacter(fullImageUrl);
            }
        }

        // También transformar la URL de la imagen del personaje base si existe
        if (userCharacter != null && userCharacter.getBaseCharacter() != null && 
            userCharacter.getBaseCharacter().getImageUrl() != null) {
            String imageUrl = userCharacter.getBaseCharacter().getImageUrl();
            // Si la URL comienza con "/assets", añadir el prefijo del servidor backend
            if (imageUrl.startsWith("/assets")) {
                // Usar "http://localhost:8081" como prefijo para el servidor backend
                String backendUrl = "http://localhost:8081";
                String fullImageUrl = backendUrl + imageUrl;
                userCharacter.getBaseCharacter().setImageUrl(fullImageUrl);
            }
        }
    }
}
