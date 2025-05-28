package com.epicbattle.epicb_api.service;

import com.epicbattle.epicb_api.model.BattleResult;
import com.epicbattle.epicb_api.repository.BattleResultRepository;
import com.epicbattle.epicb_api.dto.BattleSummary;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

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

    /**
     * Obtiene el historial de batallas de un usuario específico
     * @param userId ID del usuario
     * @return Lista de resultados de batalla del usuario
     */
    public List<BattleResult> getBattleHistoryForUser(int userId) {
        return battleResultRepository.findUserBattles(userId);
    }

    /**
     * Obtiene un resumen de las estadísticas de batalla de un usuario
     * @param userId ID del usuario
     * @return Resumen de batallas del usuario
     */
    public BattleSummary getBattleSummaryForUser(int userId) {
        List<BattleResult> battles = getBattleHistoryForUser(userId);
        
        if (battles.isEmpty()) {
            return new BattleSummary("Sin batallas", 0, 0, List.of("No hay batallas registradas"));
        }

        // Obtener la última batalla
        BattleResult lastBattle = battles.get(0);
        
        // Crear lista de eventos resumidos
        List<String> events = battles.stream()
            .map(battle -> String.format("%s vs %s - Ganador: %s",
                battle.getUser1().getNameUser(),
                battle.getUser2().getNameUser(),
                battle.getWinner().getNameUser()))
            .collect(Collectors.toList());

        // Calcular estadísticas
        long victorias = battles.stream()
            .filter(b -> b.getWinner().getIdUser() == userId)
            .count();
        
        int totalBatallas = battles.size();
        double winRate = (double) victorias / totalBatallas * 100;

        events.add(0, String.format("Resumen - Total batallas: %d, Victorias: %d, Porcentaje victoria: %.1f%%",
            totalBatallas, victorias, winRate));

        return new BattleSummary(
            lastBattle.getWinner().getNameUser(),
            lastBattle.getFinalHealth1(),
            lastBattle.getFinalHealth2(),
            events,
            lastBattle.getSurprisePackageDescription(),
            lastBattle.getPointsGained()
        );
    }

    /**
     * Guarda un resultado de batalla.
     */
    public BattleResult saveBattleResult(BattleResult battleResult) {
        return battleResultRepository.save(battleResult);
    }
}
