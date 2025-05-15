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

    /**
     * Busca un UserCharacter por ID.
     */
    public Optional<UserCharacter> getById(int id) {
        return userCharacterRepository.findById(id);
    }

    /**
     * Busca un UserCharacter por ID y lanza excepción personalizada si no existe.
     */
    public UserCharacter getByIdOrThrow(int id) {
        return userCharacterRepository.findById(id)
            .orElseThrow(() -> new com.epicbattle.epicb_api.exception.ResourceNotFoundException("UserCharacter no encontrado con id: " + id));
    }

    /**
     * Guarda un UserCharacter en la base de datos.
     */
    public UserCharacter save(UserCharacter userCharacter) {
        return userCharacterRepository.save(userCharacter);
    }

    /**
     * Busca todos los UserCharacter de un usuario.
     */
    public java.util.List<UserCharacter> findByOwner(com.epicbattle.epicb_api.model.User owner) {
        return userCharacterRepository.findAll().stream()
            .filter(uc -> uc.getOwner().getIdUser() == owner.getIdUser())
            .toList();
    }

    /**
     * Elimina un UserCharacter.
     */
    public void delete(UserCharacter userCharacter) {
        userCharacterRepository.delete(userCharacter);
    }
}

