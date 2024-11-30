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

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public Optional<User> getUserById(int id) {
        return userRepository.findById(id);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserByName(String nameUser) {
        return userRepository.findByNameUser(nameUser);
    }

    public void deleteUser(int id) {
        userRepository.deleteById(id);
    }

    public User authenticateUser(String mailUser, String passwordHash) {
        return userRepository.findByMailUserAndPasswordHash(mailUser, passwordHash);
    }

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
}


