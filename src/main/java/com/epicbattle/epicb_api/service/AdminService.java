package com.epicbattle.epicb_api.service;

import com.epicbattle.epicb_api.model.User;
import com.epicbattle.epicb_api.repository.AdminRepository;
import com.epicbattle.epicb_api.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;

    public AdminService(AdminRepository adminRepository, UserRepository userRepository) {
        this.adminRepository = adminRepository;
        this.userRepository = userRepository;
    }

    // Get
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void bannUser(User usuario, int days) {
        // Implementar lógica para banear al usuario por un número específico de días
    }

    public void eliminateUser(User usuario) {
        // Implementar lógica para eliminar un usuario
    }
}

