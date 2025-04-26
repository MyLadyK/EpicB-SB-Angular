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

    public Ranking getRankingByUser(User user) {
        return rankingRepository.findByUser(user);
    }

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
