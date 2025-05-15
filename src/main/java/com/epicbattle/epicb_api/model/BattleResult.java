package com.epicbattle.epicb_api.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BattleResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int idBattleResult;

    @ManyToOne
    @JoinColumn(name = "user1_id")
    @JsonBackReference(value="user1-battle-results")
    private User user1;

    @ManyToOne
    @JoinColumn(name = "user2_id")
    @JsonBackReference(value="user2-battle-results")
    private User user2;

    @ManyToOne
    @JoinColumn(name = "winner_id")
    @JsonBackReference(value="user-battle-results")
    private User winner;

    private Date battleDate;
}
