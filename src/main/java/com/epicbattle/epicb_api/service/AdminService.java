package com.epicbattle.epicb_api.service;

import com.epicbattle.epicb_api.model.User;
import com.epicbattle.epicb_api.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

@Service
public class AdminService {

    private final UserRepository userRepository;

    public AdminService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Get
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Banea un usuario por un número específico de días.
     * @param userId id del usuario a banear
     * @param days días de baneo
     * @throws IllegalArgumentException si el usuario no existe
     */
    public void banUser(int userId, int days) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Usuario no encontrado para baneo");
        }
        User user = userOpt.get();
        // Aquí podrías agregar un campo 'bannedUntil' en User para una solución real
        // Por ahora, simula el baneo poniendo la energía a 0 y guardando la fecha de desbloqueo
        user.setEnergy(0);
        user.setLastEnergyRefill(new Timestamp(System.currentTimeMillis() + days * 24L * 60 * 60 * 1000));
        userRepository.save(user);
    }

    /**
     * Elimina un usuario del sistema.
     * @param userId id del usuario a eliminar
     * @throws IllegalArgumentException si el usuario no existe
     */
    public void eliminateUser(int userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Usuario no encontrado para eliminar");
        }
        userRepository.deleteById(userId);
    }
}
