package com.epicbattle.epicb_api.service;

import com.epicbattle.epicb_api.model.BattleResult;
import com.epicbattle.epicb_api.repository.BattleResultRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BattleResultService {

    private final BattleResultRepository battleResultRepository;

    public BattleResultService(BattleResultRepository battleResultRepository) {
        this.battleResultRepository = battleResultRepository;
    }

    // Get
    public List<BattleResult> getAllBattleResults() {
        return battleResultRepository.findAll();
    }

    // Métodos adicionales para manejar los resultados de batalla
}
