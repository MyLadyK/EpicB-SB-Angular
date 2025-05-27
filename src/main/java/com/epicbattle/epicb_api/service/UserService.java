package com.epicbattle.epicb_api.service;

import com.epicbattle.epicb_api.dto.UserDto;
import com.epicbattle.epicb_api.model.User;
import com.epicbattle.epicb_api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;

import javax.transaction.Transactional;
import java.sql.Timestamp;

/**
 * Servicio para la gestión de usuarios.
 */
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Guarda un usuario en la base de datos.
     */
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    /**
     * Obtiene un usuario por ID. Lanza excepción personalizada si no existe.
     */
    public Optional<User> getUserById(int id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isEmpty()) {
            throw new com.epicbattle.epicb_api.exception.ResourceNotFoundException("Usuario no encontrado con id: " + id);
        }
        return user;
    }

    /**
     * Devuelve todos los usuarios.
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Devuelve todos los usuarios ordenados por puntos (de mayor a menor).
     */
    public List<User> getAllUsersOrderedByPoints() {
        return userRepository.findAllOrderByPointsDesc();
    }

    /**
     * Obtiene un usuario por nombre. Lanza excepción personalizada si no existe.
     */
    public User getUserByName(String nameUser) {
        User user = userRepository.findByNameUser(nameUser);
        if (user == null) {
            throw new com.epicbattle.epicb_api.exception.ResourceNotFoundException("Usuario no encontrado con nombre: " + nameUser);
        }
        return user;
    }

    /**
     * Elimina un usuario por ID. Lanza excepción personalizada si no existe.
     */
    public void deleteUser(int id) {
        if (!userRepository.existsById(id)) {
            throw new com.epicbattle.epicb_api.exception.ResourceNotFoundException("Usuario no encontrado para eliminar con id: " + id);
        }
        userRepository.deleteById(id);
    }

    /**
     * Autentica un usuario por email y contraseña. Lanza excepción personalizada si las credenciales son inválidas.
     */
    public User authenticateUser(String mailUser, String passwordHash) {
        User user = userRepository.findByMailUserAndPasswordHash(mailUser, passwordHash);
        if (user == null) {
            throw new com.epicbattle.epicb_api.exception.ResourceNotFoundException("Credenciales inválidas");
        }
        return user;
    }

    /**
     * Registra un nuevo usuario en la base de datos.
     */
    @Transactional
    public User registerUser(UserDto userDto) {
        User user = new User();
        user.setNameUser(userDto.getNameUser());
        user.setMailUser(userDto.getMailUser());
        user.setPasswordHash(passwordEncoder.encode(userDto.getPasswordHash()));
        user.setRole("USER"); // Asigna el rol "USER" por defecto
        user.setEnergy(8); // O cualquier valor predeterminado que quieras
        user.setLastEnergyRefill(new Timestamp(System.currentTimeMillis()));
        user.setPointsUser(0);

        return userRepository.save(user);
    }

    /**
     * Cambia el rol de un usuario.
     */
    public void changeUserRole(int userId, String newRole) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setRole(newRole);
            userRepository.save(user);
        } else {
            throw new com.epicbattle.epicb_api.exception.ResourceNotFoundException("Usuario no encontrado");
        }
    }

    /**
     * Guarda o actualiza un usuario
     */
    public User save(User user) {
        return userRepository.save(user);
    }
}
