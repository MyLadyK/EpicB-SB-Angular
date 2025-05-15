package com.epicbattle.epicb_api.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import javax.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import javax.validation.constraints.NotNull;

import java.sql.Timestamp;
import java.util.List;

@Entity
@Table(name = "users")

@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int idUser;

    @NotNull(message = "El nombre no puede estar en blanco")
    @Size(min = 1, max = 50, message = "El nombre debe tener entre 1 y 50 caracteres")
    private String nameUser;

    @NotNull(message = "El correo no puede estar en blanco")
    @Size(min = 1, max = 100, message = "El correo debe tener entre 1 y 100 caracteres")
    private String mailUser;

    @NotNull(message = "La contraseña no puede estar en blanco")
    @Size(min = 8, max = 20, message = "La contraseña debe tener entre 8 y 20 caracteres")
    private String passwordHash;

    @Column(name = "role")
    private String role;

    private int energy;
    private Timestamp lastEnergyRefill;
    private int pointsUser;

    @OneToMany(mappedBy = "owner")
    @JsonManagedReference
    private List<UserCharacter> characters;

    @OneToMany(mappedBy = "user")
    @JsonManagedReference(value="user-messages-sent")
    private List<Message> messagesSent;

    @OneToMany(mappedBy = "user")
    @JsonManagedReference(value="user-messages-received")
    private List<Message> messagesReceived;

    @OneToMany(mappedBy = "winner")
    @JsonManagedReference(value="user-battle-results")
    private List<BattleResult> battleResults;
}
