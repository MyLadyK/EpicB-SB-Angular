package com.epicbattle.epicb_api.controller;

import com.epicbattle.epicb_api.model.User;
import com.epicbattle.epicb_api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity <?> Login(@RequestBody User loginUser){
        User user = userRepository.findByMailUserAndPasswordHash(loginUser.getMailUser(), loginUser.getPasswordHash());
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales no válidas");
        }
    }
}
