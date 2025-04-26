package com.epicbattle.epicb_api.service;

import com.epicbattle.epicb_api.model.UserCharacter;
import com.epicbattle.epicb_api.repository.UserCharacterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserCharacterService {
    @Autowired
    private UserCharacterRepository userCharacterRepository;

    public Optional<UserCharacter> getById(int id) {
        return userCharacterRepository.findById(id);
    }

    public UserCharacter save(UserCharacter userCharacter) {
        return userCharacterRepository.save(userCharacter);
    }
}
