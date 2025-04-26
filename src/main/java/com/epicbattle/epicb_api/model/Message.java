package com.epicbattle.epicb_api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @NotNull(message = "El mensaje no puede estar en blanco")
    @Size(min = 1, max = 1248, message = "El mensaje debe tener entre 1 y 1248 caracteres")
    private String content;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
