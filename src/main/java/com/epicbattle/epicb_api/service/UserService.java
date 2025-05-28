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
 * Servicio que maneja toda la lógica de negocio relacionada con los usuarios.
 * Incluye operaciones CRUD, autenticación, y gestión de roles.
 */
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Guarda un usuario en la base de datos.
     * 
     * @param user Usuario a guardar
     * @return Usuario guardado con su ID generado
     */
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    /**
     * Obtiene un usuario por su ID.
     * 
     * @param id ID del usuario a buscar
     * @return Optional con el usuario si existe
     * @throws ResourceNotFoundException si el usuario no existe
     */
    public Optional<User> getUserById(int id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isEmpty()) {
            throw new com.epicbattle.epicb_api.exception.ResourceNotFoundException("Usuario no encontrado con id: " + id);
        }
        return user;
    }

    /**
     * Obtiene todos los usuarios registrados.
     * 
     * @return Lista de todos los usuarios
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Obtiene todos los usuarios ordenados por puntos de mayor a menor.
     * Excluye usuarios con rol ADMIN.
     * 
     * @return Lista de usuarios ordenada por puntos
     */
    public List<User> getAllUsersOrderedByPoints() {
        return userRepository.findAllOrderByPointsDesc();
    }

    /**
     * Obtiene un usuario por su nombre de usuario.
     * 
     * @param nameUser Nombre del usuario a buscar
     * @return Usuario encontrado
     * @throws ResourceNotFoundException si el usuario no existe
     */
    public User getUserByName(String nameUser) {
        User user = userRepository.findByNameUser(nameUser);
        if (user == null) {
            throw new com.epicbattle.epicb_api.exception.ResourceNotFoundException("Usuario no encontrado con nombre: " + nameUser);
        }
        return user;
    }

    /**
     * Elimina un usuario por su ID.
     * 
     * @param id ID del usuario a eliminar
     * @throws ResourceNotFoundException si el usuario no existe
     */
    public void deleteUser(int id) {
        if (!userRepository.existsById(id)) {
            throw new com.epicbattle.epicb_api.exception.ResourceNotFoundException("Usuario no encontrado para eliminar con id: " + id);
        }
        userRepository.deleteById(id);
    }

    /**
     * Autentica un usuario por email y contraseña.
     * 
     * @param mailUser Email del usuario
     * @param passwordHash Contraseña hasheada
     * @return Usuario autenticado
     * @throws ResourceNotFoundException si las credenciales son inválidas
     */
    public User authenticateUser(String mailUser, String passwordHash) {
        User user = userRepository.findByMailUserAndPasswordHash(mailUser, passwordHash);
        if (user == null) {
            throw new com.epicbattle.epicb_api.exception.ResourceNotFoundException("Credenciales inválidas");
        }
        return user;
    }

    /**
     * Registra un nuevo usuario en el sistema.
     * Configura valores por defecto y encripta la contraseña.
     * 
     * @param userDto DTO con los datos del nuevo usuario
     * @return Usuario registrado
     */
    @Transactional
    public User registerUser(UserDto userDto) {
        User user = new User();
        user.setNameUser(userDto.getNameUser());
        user.setMailUser(userDto.getMailUser());
        user.setPasswordHash(passwordEncoder.encode(userDto.getPasswordHash()));
        user.setRole("USER");
        user.setEnergy(8);
        user.setLastEnergyRefill(new Timestamp(System.currentTimeMillis()));
        user.setPointsUser(0);

        return userRepository.save(user);
    }

    /**
     * Cambia el rol de un usuario.
     * 
     * @param userId ID del usuario
     * @param newRole Nuevo rol a asignar
     * @throws ResourceNotFoundException si el usuario no existe
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
