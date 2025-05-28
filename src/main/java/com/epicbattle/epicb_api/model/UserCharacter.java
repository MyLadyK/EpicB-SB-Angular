package com.epicbattle.epicb_api.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

/**
 * @author [Your Name]
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserCharacter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int idUserCharacter;

    @ManyToOne
    @JoinColumn(name = "idUser")
    @JsonBackReference
    private User owner;

    @ManyToOne
    @JoinColumn(name = "base_character_id")
    private Character baseCharacter;

    @NotNull(message = "La salud no puede ser null")
    @Min(value = 1, message = "La salud mínima es 1")
    private double healthUserCharacter;

    @NotNull(message = "El ataque no puede ser null")
    @Min(value = 1, message = "El ataque mínimo es 1")
    private double attackUserCharacter;

    @NotNull(message = "La defensa no puede ser null")
    @Min(value = 1, message = "La defensa mínima es 1")
    private double defenseUserCharacter;

    @NotNull(message = "La velocidad no puede ser null")
    @Min(value = 1, message = "La velocidad mínima es 1")
    private double speedUserCharacter;

    @NotNull(message = "El aguante no puede ser null")
    @Min(value = 1, message = "El aguante mínimo es 1")
    private double staminaUserCharacter;

    @NotNull(message = "La inteligencia no puede ser null")
    @Min(value = 1, message = "La inteligencia mínima es 1")
    private double intelligenceUserCharacter;

    @NotNull(message = "El especial no puede ser null")
    @Min(value = 1, message = "El especial mínimo es 1")
    private double specialUserCharacter;

    private String imageUrlUserCharacter;
    private int timesUsed;
}
