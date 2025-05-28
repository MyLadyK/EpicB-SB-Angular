package com.epicbattle.epicb_api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

/**
 * Entidad que representa un personaje base en el juego.
 * Cada personaje tiene atributos básicos como salud, ataque, defensa, etc.
 * Los usuarios pueden obtener copias de estos personajes base para su colección.
 */
@Entity
@Table(name = "characters")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Character {

    /**
     * Identificador único del personaje
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int idCharacter;

    /**
     * Nombre del personaje
     * Debe tener entre 1 y 80 caracteres
     */
    @NotNull(message = "El nombre no puede ser null")
    @Size(min = 1, max = 80, message = "El nombre debe tener entre 1 y 80 caracteres")
    private String nameCharacter;

    /**
     * Categoría del personaje (ej: "Guerrero", "Mago", etc.)
     * Debe tener entre 1 y 80 caracteres
     */
    @Size(min = 1, max = 80, message = "La categoría debe tener entre 1 y 80 caracteres")
    private String categoryCharacter;

    /**
     * Universo al que pertenece el personaje
     * Debe tener entre 1 y 100 caracteres
     */
    @Size(min = 1, max = 100, message = "El universo al que pertenece debe tener entre 1 y 100 caracteres")
    private String universeCharacter;

    /**
     * Puntos de salud del personaje
     * Rango: 1-100
     */
    @NotNull(message = "La salud no puede ser null")
    @Min(value = 1, message = "La salud mínima es 1")
    @Max(value = 100, message = "La salud máxima es 100")
    private double healthCharacter;

    /**
     * Puntos de ataque del personaje
     * Rango: 1-10
     */
    @NotNull(message = "El ataque no puede ser null")
    @Min(value = 1, message = "El ataque mínimo es 1")
    @Max(value = 10, message = "El ataque máximo es 10")
    private double attackCharacter;

    /**
     * Puntos de defensa del personaje
     * Rango: 1-10
     */
    @NotNull(message = "La defensa no puede ser null")
    @Min(value = 1, message = "La defensa mínima es 1")
    @Max(value = 10, message = "La defensa máxima es 10")
    private double defenseCharacter;

    /**
     * Velocidad del personaje
     * Rango: 1-10
     */
    @NotNull(message = "La velocidad no puede ser null")
    @Min(value = 1, message = "La velocidad mínima es 1")
    @Max(value = 10, message = "La velocidad máxima es 10")
    private double speedCharacter;

    /**
     * Aguante del personaje
     * Rango: 1-10
     */
    @NotNull(message = "El aguante no puede ser null")
    @Min(value = 1, message = "El aguante mínimo es 1")
    @Max(value = 10, message = "El aguante máximo es 10")
    private double staminaCharacter;

    /**
     * Inteligencia del personaje
     * Rango: 1-10
     */
    @NotNull(message = "La inteligencia no puede ser null")
    @Min(value = 1, message = "La inteligencia mínima es 1")
    @Max(value = 10, message = "La inteligencia máxima es 10")
    private double intelligenceCharacter;

    /**
     * Habilidad especial del personaje
     * Rango: 1-5
     */
    @NotNull(message = "El especial no puede ser null")
    @Min(value = 1, message = "El especial mínimo es 1")
    @Max(value = 5, message = "El especial máximo es 5")
    private double specialCharacter;

    /**
     * URL de la imagen del personaje
     */
    private String imageUrl;
}
