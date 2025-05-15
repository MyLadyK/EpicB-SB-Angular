package com.epicbattle.epicb_api.controller;

import com.epicbattle.epicb_api.model.Character;
import com.epicbattle.epicb_api.service.CharacterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.io.File;

@RestController
@RequestMapping("/api/characters")
public class CharacterController {

    private final CharacterService characterService;

    @Autowired
    public CharacterController(CharacterService characterService) {
        this.characterService = characterService;
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadCharacterImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("nombrePersonaje") String nombrePersonaje,
            @RequestParam("universo") String universo) {
        try {
            // Construir ruta: assets/imagenes/personajes/{universo}/
            String baseDir = "assets/imagenes/personajes";
            String universoDir = baseDir + "/" + universo;
            File dir = new File(universoDir);
            if (!dir.exists()) dir.mkdirs();

            // Obtener extensión
            String ext = Optional.ofNullable(file.getOriginalFilename())
                    .filter(f -> f.contains("."))
                    .map(f -> f.substring(f.lastIndexOf('.')))
                    .orElse(".png");

            // Nombre del archivo: nombrePersonaje.ext (sin espacios)
            String sanitizedNombre = nombrePersonaje.replaceAll("\\s+", "");
            // Construir ruta absoluta para guardar la imagen en resources/static/assets/imagenes/personajes/<universo>/
            String basePath = System.getProperty("user.dir") + "/src/main/resources/static/assets/imagenes/personajes/" + universo;
            String fileName = sanitizedNombre + ext;
            String filePath = basePath + "/" + fileName;

            // Guardar archivo
            File dest = new File(filePath);
            File parentDir = dest.getParentFile();
            if (!parentDir.exists()) {
                parentDir.mkdirs();
            }
            file.transferTo(dest);

            // Ruta relativa para la BD (para servir desde el frontend)
            String relativePath = "/assets/imagenes/personajes/" + universo + "/" + fileName;

            Map<String, String> response = new HashMap<>();
            response.put("imageUrl", relativePath);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error al subir imagen"));
        }
    }


    @GetMapping
    public ResponseEntity<List<Character>> getAllCharacters() {
        List<Character> characters = characterService.getAllCharacters();

        // Transformar las URLs de las imágenes para que apunten al servidor backend
        characters.forEach(character -> {
            if (character.getImageUrl() != null) {
                String imageUrl = character.getImageUrl();
                // Si la URL comienza con "/assets", añadir el prefijo del servidor backend
                if (imageUrl.startsWith("/assets")) {
                    // Usar "http://localhost:8081" como prefijo para el servidor backend
                    String backendUrl = "http://localhost:8081";
                    String fullImageUrl = backendUrl + imageUrl;
                    character.setImageUrl(fullImageUrl);
                }
            }
        });

        return ResponseEntity.ok(characters);
    }

    @PostMapping
    public ResponseEntity<?> createCharacter(@Valid @RequestBody Character character) {
        try {
            Character created = characterService.createCharacter(character);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCharacterById(@PathVariable int id) {
        try {
            Character character = characterService.getCharacterById(id);
            if (character != null) {
                // Transformar la URL de la imagen para que apunte al servidor backend
                if (character.getImageUrl() != null) {
                    String imageUrl = character.getImageUrl();
                    // Si la URL comienza con "/assets", añadir el prefijo del servidor backend
                    if (imageUrl.startsWith("/assets")) {
                        // Usar "http://localhost:8081" como prefijo para el servidor backend
                        String backendUrl = "http://localhost:8081";
                        String fullImageUrl = backendUrl + imageUrl;
                        character.setImageUrl(fullImageUrl);
                    }
                }
                return ResponseEntity.ok(character);
            } else {
                return ResponseEntity.status(404).body("Personaje no encontrado");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCharacter(@PathVariable int id, @Valid @RequestBody Character characterDetails) {
        try {
            Character updated = characterService.updateCharacter(id, characterDetails);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCharacter(@PathVariable int id) {
        try {
            characterService.deleteCharacter(id);
            return ResponseEntity.ok("Personaje eliminado");
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
