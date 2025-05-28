package com.epicbattle.epicb_api.repository;

import com.epicbattle.epicb_api.model.Ranking;
import com.epicbattle.epicb_api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RankingRepository extends JpaRepository<Ranking, Integer> {
    Ranking findByUser(User user);
    Optional<Ranking> findByUser_IdUser(int userId);
}
