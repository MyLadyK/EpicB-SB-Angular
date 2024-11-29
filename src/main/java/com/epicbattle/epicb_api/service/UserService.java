package com.epicbattle.epicb_api.service;

import com.epicbattle.epicb_api.model.User;
import com.epicbattle.epicb_api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

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
}

