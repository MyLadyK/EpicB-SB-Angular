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
    private Date battleDate = new Date();

    @Column(name = "battle_points")
    private int battlePoints = 0;

    @ElementCollection
    @CollectionTable(
        name = "battle_events",
        joinColumns = @JoinColumn(name = "battle_result_id")
    )
    private List<BattleEvent> events = new ArrayList<>();

    @Column(name = "final_health1")
    private double finalHealth1 = 100.0;

    @Column(name = "final_health2")
    private double finalHealth2 = 100.0;

    @Column(name = "opponent_name")
    private String opponentName = "";

    @Column(name = "result")
    private String result = "";

    @Column(name = "points_gained")
    private int pointsGained = 0;

    @Column(name = "points_lost")
    private int pointsLost = 0;

    @Column(name = "surprise_package_description")
    private String surprisePackageDescription = "";

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

    public User getUser1() {
        return user1;
    }

    public void setUser1(User user1) {
        this.user1 = user1;
    }

    public User getUser2() {
        return user2;
    }

    public void setUser2(User user2) {
        this.user2 = user2;
    }

    public User getWinner() {
        return winner;
    }

    public void setWinner(User winner) {
        this.winner = winner;
    }

    public Date getBattleDate() {
        return battleDate;
    }

    public void setBattleDate(Date battleDate) {
        this.battleDate = battleDate != null ? battleDate : new Date();
    }

    public int getBattlePoints() {
        return battlePoints;
    }

    public void setBattlePoints(int battlePoints) {
        this.battlePoints = battlePoints;
    }

    public double getFinalHealth1() {
        return finalHealth1;
    }

    public void setFinalHealth1(double finalHealth1) {
        this.finalHealth1 = finalHealth1;
    }

    public double getFinalHealth2() {
        return finalHealth2;
    }

    public void setFinalHealth2(double finalHealth2) {
        this.finalHealth2 = finalHealth2;
    }

    public String getOpponentName() {
        return opponentName;
    }

    public void setOpponentName(String opponentName) {
        this.opponentName = opponentName != null ? opponentName : "";
    }

    public int getPointsGained() {
        return pointsGained;
    }

    public void setPointsGained(int pointsGained) {
        this.pointsGained = pointsGained;
    }

    public int getPointsLost() {
        return pointsLost;
    }

    public void setPointsLost(int pointsLost) {
        this.pointsLost = pointsLost;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result != null ? result : "";
    }

    public String getSurprisePackageDescription() {
        return surprisePackageDescription;
    }

    public void setSurprisePackageDescription(String surprisePackageDescription) {
        this.surprisePackageDescription = surprisePackageDescription != null ? surprisePackageDescription : "";
    }

    public List<BattleEvent> getEvents() {
        return events;
    }

    public void setEvents(List<BattleEvent> events) {
        this.events = events != null ? events : new ArrayList<>();
    }
}
