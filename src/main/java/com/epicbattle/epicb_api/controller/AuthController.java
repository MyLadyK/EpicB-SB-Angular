package com.epicbattle.epicb_api.controller;

import com.epicbattle.epicb_api.model.User;
import com.epicbattle.epicb_api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginUser) {
        try {
            System.out.println("Attempting login with: " + loginUser.getMailUser() + ", " + loginUser.getPasswordHash());
            User user = userRepository.findByMailUser(loginUser.getMailUser());
            if (user != null && passwordEncoder.matches(loginUser.getPasswordHash(), user.getPasswordHash())) {
                System.out.println("User found: " + user.getNameUser());
                return ResponseEntity.ok(user);
            } else {
                System.out.println("Invalid credentials");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales no válidas");
            }
        } catch (Exception e) {
            System.out.println("Exception in AuthController: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error inesperado.");
        }
    }

    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdmin(@RequestBody User adminUser) {
        try {
            adminUser.setPasswordHash(passwordEncoder.encode(adminUser.getPasswordHash()));
            adminUser.setRole("ADMIN");
            userRepository.save(adminUser);
            System.out.println("Admin created with role: " + adminUser.getRole());
            return ResponseEntity.ok("Administrador creado exitosamente.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al crear el administrador.");
        }
    }
}
