package com.epicbattle.epicb_api.repository;

import com.epicbattle.epicb_api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    User findByNameUser(String nameUser);
    User findByMailUserAndPasswordHash(String mailUser, String passwordHash);
    User findByMailUser(String mailUser);  // Simplificación del método

    // Find all users ordered by points in descending order, excluding ADMIN users
    @Query("SELECT u FROM User u WHERE u.role != 'ADMIN' ORDER BY u.pointsUser DESC")
    List<User> findAllOrderByPointsDesc();
}
