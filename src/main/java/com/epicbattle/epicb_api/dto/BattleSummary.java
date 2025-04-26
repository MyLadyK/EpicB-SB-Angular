package com.epicbattle.epicb_api.dto;

import java.util.List;

public class BattleSummary {
    private String winnerName;
    private double finalHealth1;
    private double finalHealth2;
    private List<String> events;

    public BattleSummary(String winnerName, double finalHealth1, double finalHealth2, List<String> events) {
        this.winnerName = winnerName;
        this.finalHealth1 = finalHealth1;
        this.finalHealth2 = finalHealth2;
        this.events = events;
    }

    public String getWinnerName() { return winnerName; }
    public void setWinnerName(String winnerName) { this.winnerName = winnerName; }
    public double getFinalHealth1() { return finalHealth1; }
    public void setFinalHealth1(double finalHealth1) { this.finalHealth1 = finalHealth1; }
    public double getFinalHealth2() { return finalHealth2; }
    public void setFinalHealth2(double finalHealth2) { this.finalHealth2 = finalHealth2; }
    public List<String> getEvents() { return events; }
    public void setEvents(List<String> events) { this.events = events; }
}
