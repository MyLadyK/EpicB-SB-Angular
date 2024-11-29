package com.epicbattle.epicb_api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ranking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int idRanking;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private int userPoints;
}

