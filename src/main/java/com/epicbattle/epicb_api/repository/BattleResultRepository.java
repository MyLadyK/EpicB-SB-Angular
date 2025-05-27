package com.epicbattle.epicb_api.repository;

import com.epicbattle.epicb_api.model.BattleResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BattleResultRepository extends JpaRepository<BattleResult, Integer> {
    
    @Query("SELECT b FROM BattleResult b WHERE b.user1.idUser = :userId OR b.user2.idUser = :userId ORDER BY b.battleDate DESC")
    List<BattleResult> findUserBattles(@Param("userId") int userId);
    
    @Query("SELECT b FROM BattleResult b WHERE b.winner.idUser = :userId")
    List<BattleResult> findWonBattles(@Param("userId") int userId);
}
