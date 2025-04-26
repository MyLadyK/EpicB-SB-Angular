package com.epicbattle.epicb_api.service;

import com.epicbattle.epicb_api.model.Ranking;
import com.epicbattle.epicb_api.model.User;
import com.epicbattle.epicb_api.repository.RankingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RankingService {
    @Autowired
    private RankingRepository rankingRepository;

    /**
     * Obtiene el ranking de un usuario. Lanza excepción si no existe ranking.
     */
    public Ranking getRankingByUser(User user) {
        Ranking ranking = rankingRepository.findByUser(user);
        if (ranking == null) {
            throw new com.epicbattle.epicb_api.exception.ResourceNotFoundException("Ranking no encontrado para el usuario: " + user.getIdUser());
        }
        return ranking;
    }

    /**
     * Suma puntos al ranking de un usuario, creando el ranking si no existe.
     */
    public void addPointsToUser(User user, int points) {
        Ranking ranking = rankingRepository.findByUser(user);
        if (ranking == null) {
            ranking = new Ranking();
            ranking.setUser(user);
            ranking.setUserPoints(points);
        } else {
            ranking.setUserPoints(ranking.getUserPoints() + points);
        }
        rankingRepository.save(ranking);
    }
}
