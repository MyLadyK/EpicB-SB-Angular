package com.epicbattle.epicb_api.model;

import jakarta.persistence.Embeddable;
import jakarta.persistence.Transient;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BattleEvent {
    public enum Target {
        character1,
        character2
    }

    private Target target;
    private double damage;
    private String description;

    @Transient
    private UserCharacter attacker;
    @Transient
    private UserCharacter defender;

    public BattleEvent(Target target, double damage, UserCharacter attacker, UserCharacter defender, String description) {
        this.target = target;
        this.damage = damage;
        this.attacker = attacker;
        this.defender = defender;
        this.description = description;
    }
} 