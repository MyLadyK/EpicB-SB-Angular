package com.epicbattle.epicb_api.model;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "battleresult")
@JsonIdentityInfo(
    generator = ObjectIdGenerators.PropertyGenerator.class,
    property = "idBattleResult"
)
public class BattleResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idBattleResult")
    private int idBattleResult;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user1Id")
    private User user1;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user2Id")
    private User user2;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "winnerId")
    private User winner;

    @Column(name = "battleDate")
    @Temporal(TemporalType.TIMESTAMP)
    private Date battleDate;

    @Column(name = "battle_points")
    private int battlePoints;

    @ElementCollection
    @CollectionTable(
        name = "battle_events",
        joinColumns = @JoinColumn(name = "battle_result_id")
    )
    private List<BattleEvent> events = new ArrayList<>();

    @Column(name = "final_health1")
    private double finalHealth1;

    @Column(name = "final_health2")
    private double finalHealth2;

    @Column(name = "opponent_name")
    private String opponentName;

    @Column(name = "result")
    private String result;

    @Column(name = "points_gained")
    private int pointsGained;

    @Column(name = "points_lost")
    private int pointsLost;

    @Column(name = "surprise_package_description", length = 1000)
    private String surprisePackageDescription;

    @Transient
    private String date;

    @Transient
    private boolean isUser1Winner;

    @Transient
    private String surpriseDescription;

    public void setTransientFields(double finalHealth1, double finalHealth2, String opponentName, boolean isUser1Winner, String surpriseDescription) {
        this.finalHealth1 = finalHealth1;
        this.finalHealth2 = finalHealth2;
        this.opponentName = opponentName;
        this.isUser1Winner = isUser1Winner;
        this.surpriseDescription = surpriseDescription;
        this.result = isUser1Winner ? "WIN" : "LOSE";
        this.pointsGained = isUser1Winner ? 20 : -8;
        this.pointsLost = isUser1Winner ? -8 : 20;
        this.battlePoints = isUser1Winner ? 20 : -8;
        this.surprisePackageDescription = surpriseDescription;
        this.date = this.battleDate != null ? this.battleDate.toString() : null;
    }

    // Getter y setter para idBattleResult
    public int getIdBattleResult() {
        return this.idBattleResult;
    }

    public void setIdBattleResult(int idBattleResult) {
        this.idBattleResult = idBattleResult;
    }
}
