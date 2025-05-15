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

    /**
     * Devuelve todos los resultados de batalla.
     */
    public List<BattleResult> getAllBattleResults() {
        return battleResultRepository.findAll();
    }

    /**
     * Busca un resultado de batalla por ID y lanza excepción personalizada si no existe.
     */
    public BattleResult getBattleResultById(int id) {
        return battleResultRepository.findById(id)
                .orElseThrow(() -> new com.epicbattle.epicb_api.exception.ResourceNotFoundException("Resultado de batalla no encontrado con id: " + id));
    }

    // Métodos adicionales para manejar los resultados de batalla

    /**
     * Guarda un resultado de batalla.
     */
    public BattleResult saveBattleResult(BattleResult battleResult) {
        return battleResultRepository.save(battleResult);
    }
}
