package com.epicbattle.epicb_api.controller;

import com.epicbattle.epicb_api.dto.UserDto;
import com.epicbattle.epicb_api.dto.ChangeRoleRequestDTO;
import com.epicbattle.epicb_api.dto.UserProfileDTO;
import com.epicbattle.epicb_api.model.User;
import com.epicbattle.epicb_api.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import javax.validation.Valid;

import com.epicbattle.epicb_api.dto.ErrorResponseDTO;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserDto userDto) {
        try {
            User registeredUser = userService.registerUser(userDto);
            return ResponseEntity.ok(registeredUser);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/ranking")
    public ResponseEntity<List<UserProfileDTO>> getUserRanking() {
        return ResponseEntity.ok(
            userService.getAllUsersOrderedByPoints().stream()
                .map(UserProfileDTO::fromUser)
                .collect(Collectors.toList())
        );
    }

    @GetMapping
    public ResponseEntity<List<UserProfileDTO>> getAllUsers() {
        return ResponseEntity.ok(
            userService.getAllUsers().stream()
                .map(UserProfileDTO::fromUser)
                .collect(Collectors.toList())
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable int id) {
        Optional<User> user = userService.getUserById(id);
        if (user.isPresent()) {
            return ResponseEntity.ok(UserProfileDTO.fromUser(user.get()));
        } else {
            ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error("User Not Found")
                .message("No user found with ID: " + id)
                .build();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    @GetMapping("/name/{nameUser}")
    public ResponseEntity<?> getUserByName(@PathVariable String nameUser) {
        User user = userService.getUserByName(nameUser);
        if (user != null) {
            return ResponseEntity.ok(UserProfileDTO.fromUser(user));
        } else {
            return ResponseEntity.status(404).body("Usuario no encontrado");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable int id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/change-role")
    public ResponseEntity<?> changeUserRole(@Valid @RequestBody ChangeRoleRequestDTO payload) {
        try {
            userService.changeUserRole(payload.getUserId(), payload.getNewRole());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
