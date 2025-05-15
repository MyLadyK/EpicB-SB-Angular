package com.epicbattle.epicb_api.controller;

import com.epicbattle.epicb_api.model.User;
import com.epicbattle.epicb_api.model.UserCharacter;
import com.epicbattle.epicb_api.model.Character;
import com.epicbattle.epicb_api.repository.UserRepository;
import com.epicbattle.epicb_api.repository.CharacterRepository;
import com.epicbattle.epicb_api.service.UserCharacterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/user-characters")
public class UserCharacterController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CharacterRepository characterRepository;
    @Autowired
    private UserCharacterService userCharacterService;

    // Obtener la colección del usuario autenticado
    @GetMapping("/mine")
    public ResponseEntity<List<UserCharacter>> getMyCharacters() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByNameUser(username);
        if (user == null) {
            user = userRepository.findByMailUser(username);
        }
        if (user == null) {
            user = userRepository.findByMailUser(username);
        }
        if (user == null) return ResponseEntity.notFound().build();
        List<UserCharacter> collection = userCharacterService.findByOwner(user);

        // Transformar las URLs de las imágenes para que apunten al servidor backend
        collection.forEach(userCharacter -> {
            Character baseCharacter = userCharacter.getBaseCharacter();
            if (baseCharacter != null && baseCharacter.getImageUrl() != null) {
                String imageUrl = baseCharacter.getImageUrl();
                // Si la URL comienza con "/assets", añadir el prefijo del servidor backend
                if (imageUrl.startsWith("/assets")) {
                    // Usar "http://localhost:8081" como prefijo para el servidor backend
                    String backendUrl = "http://localhost:8081";
                    String fullImageUrl = backendUrl + imageUrl;
                    baseCharacter.setImageUrl(fullImageUrl);
                }
            }
        });

        return ResponseEntity.ok(collection);
    }

    // Añadir personaje a la colección del usuario autenticado
    @PostMapping("/add/{characterId}")
    public ResponseEntity<?> addCharacterToCollection(@PathVariable Long characterId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByNameUser(username);
        if (user == null) {
            user = userRepository.findByMailUser(username);
        }
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Usuario no autenticado"));
        List<UserCharacter> collection = userCharacterService.findByOwner(user);
        if (collection.size() >= 8) {
            return ResponseEntity.badRequest().body(Map.of("error", "No puedes tener más de 8 personajes en tu colección"));
        }
        Optional<Character> characterOpt = characterRepository.findById(characterId.intValue());
        if (characterOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Personaje no encontrado"));
        }
        // Evitar duplicados
        boolean alreadyInCollection = collection.stream().anyMatch(uc -> uc.getBaseCharacter().getIdCharacter() == characterId);
        if (alreadyInCollection) {
            return ResponseEntity.badRequest().body(Map.of("error", "El personaje ya está en tu colección"));
        }
        UserCharacter userCharacter = new UserCharacter();
        userCharacter.setOwner(user);
        Character base = characterOpt.get();
        userCharacter.setBaseCharacter(base);
        userCharacter.setHealthUserCharacter(base.getHealthCharacter());
        userCharacter.setAttackUserCharacter(base.getAttackCharacter());
        userCharacter.setDefenseUserCharacter(base.getDefenseCharacter());
        userCharacter.setSpeedUserCharacter(base.getSpeedCharacter());
        userCharacter.setStaminaUserCharacter(base.getStaminaCharacter());
        userCharacter.setIntelligenceUserCharacter(base.getIntelligenceCharacter());
        userCharacter.setSpecialUserCharacter(base.getSpecialCharacter());
        userCharacter.setImageUrlUserCharacter(base.getImageUrl());
        userCharacter.setTimesUsed(0);
        userCharacterService.save(userCharacter);
        return ResponseEntity.ok(Map.of("message", "Personaje añadido a tu colección"));
    }

    // Eliminar personaje de la colección del usuario autenticado
    @DeleteMapping("/remove/{characterId}")
    public ResponseEntity<?> removeCharacterFromCollection(@PathVariable Long characterId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByNameUser(username);
        if (user == null) {
            user = userRepository.findByMailUser(username);
        }
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Usuario no autenticado"));
        List<UserCharacter> collection = userCharacterService.findByOwner(user);
        Optional<UserCharacter> userCharacterOpt = collection.stream()
                .filter(uc -> uc.getBaseCharacter().getIdCharacter() == characterId).findFirst();
        if (userCharacterOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El personaje no está en tu colección"));
        }
        userCharacterService.delete(userCharacterOpt.get());
        return ResponseEntity.ok(Map.of("message", "Personaje eliminado de tu colección"));
    }
}
