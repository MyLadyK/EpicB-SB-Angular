package com.epicbattle.epicb_api.repository;

import com.epicbattle.epicb_api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository <User, Integer> {
    User findByNameUser (String nameUser);
    ; User findByMailUserAndPasswordHash(String mailUser, String passwordHash);
}
