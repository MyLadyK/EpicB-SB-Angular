package com.epicbattle.epicb_api.repository;

import com.epicbattle.epicb_api.model.UserCharacter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserCharacterRepository extends JpaRepository<UserCharacter, Integer> {
}
