package com.epicbattle.epicb_api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;


@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserCharacter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int idUserCharacter;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;

    @ManyToOne
    @JoinColumn(name = "base_character_id")
    private Character baseCharacter;

    @NotNull(message = "La salud no puede ser null")
    @Min(value = 1, message = "La salud mínima es 1")
    @Max(value = 100, message = "La salud máxima es 100")
    private double healthUserCharacter;

    @NotNull(message = "El ataque no puede ser null")
    @Min(value = 1, message = "El ataque mínimo es 1")
    @Max(value = 10, message = "El ataque máximo es 10")
    private double attackUserCharacter;

    @NotNull(message = "La defensa no puede ser null")
    @Min(value = 1, message = "La defensa mínima es 1")
    @Max(value = 10, message = "La defensa máxima es 10")
    private double defenseUserCharacter;

    @NotNull(message = "La velocidad no puede ser null")
    @Min(value = 1, message = "La velocidad mínima es 1")
    @Max(value = 10, message = "La velocidad máxima es 10")
    private double speedUserCharacter;

    @NotNull(message = "El aguante no puede ser null")
    @Min(value = 1, message = "El aguante mínimo es 1")
    @Max(value = 10, message = "El aguante máximo es 10")
    private double staminaUserCharacter;

    @NotNull(message = "La inteligencia no puede ser null")
    @Min(value = 1, message = "La inteligencia mínima es 1")
    @Max(value = 10, message = "La inteligencia máxima es 10")
    private double intelligenceUserCharacter;

    @NotNull(message = "El especial no puede ser null")
    @Min(value = 1, message = "El especial mínimo es 1")
    @Max(value = 5, message = "El especial máximo es 5")
    private double specialUserCharacter;

    private String imageUrlUserCharacter;
    private int timesUsed;
}
