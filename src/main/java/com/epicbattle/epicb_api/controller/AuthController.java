package com.epicbattle.epicb_api.controller;

import com.epicbattle.epicb_api.model.User;
import com.epicbattle.epicb_api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;
import javax.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
private com.epicbattle.epicb_api.JwtUtil jwtUtil;

@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
    try {
        String mailUser = loginRequest.get("mailUser");
        String password = loginRequest.get("password");
        System.out.println("Intentando login para: " + mailUser);
        User user = null;
        if (mailUser != null && password != null) {
            user = userRepository.findByMailUser(mailUser);
        }
        if (user != null && passwordEncoder.matches(password, user.getPasswordHash())) {
            System.out.println("Login correcto para: " + mailUser);
            String token = jwtUtil.generateToken(user.getNameUser());
            Map<String, Object> userData = new HashMap<>();
            userData.put("idUser", user.getIdUser());
            userData.put("nameUser", user.getNameUser());
            userData.put("mailUser", user.getMailUser());
            userData.put("roleUser", user.getRole());
            userData.put("energy", user.getEnergy());
            userData.put("lastEnergyRefill", user.getLastEnergyRefill());
            userData.put("pointsUser", user.getPointsUser());
            userData.put("token", token);
            return ResponseEntity.ok(userData);
        } else {
            System.out.println("Login fallido para: " + mailUser);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales no válidas");
        }
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error inesperado: " + e.getMessage());
    }
}

    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdmin(@Valid @RequestBody User adminUser) {
        try {
            adminUser.setPasswordHash(passwordEncoder.encode(adminUser.getPasswordHash()));
            adminUser.setRole("ADMIN");
            userRepository.save(adminUser);
            return ResponseEntity.ok("Administrador creado exitosamente.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al crear el administrador: " + e.getMessage());
        }
    }
}
