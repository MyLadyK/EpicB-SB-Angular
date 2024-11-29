package com.epicbattle.epicb_api.repository;

import com.epicbattle.epicb_api.model.BattleResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BattleResultRepository extends JpaRepository <BattleResult, Integer> {
}
