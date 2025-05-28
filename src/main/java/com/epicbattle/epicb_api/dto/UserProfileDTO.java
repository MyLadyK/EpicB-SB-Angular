package com.epicbattle.epicb_api.dto;

import com.epicbattle.epicb_api.model.User;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserProfileDTO {
    private int idUser;
    private String nameUser;
    private String mailUser;
    private int energy;
    private LocalDateTime lastEnergyRefill;
    private int pointsUser;
    private String role;

    public static UserProfileDTO fromUser(User user) {
        return UserProfileDTO.builder()
            .idUser(user.getIdUser())
            .nameUser(user.getNameUser())
            .mailUser(user.getMailUser())
            .energy(user.getEnergy())
            .lastEnergyRefill(user.getLastEnergyRefill() != null ? user.getLastEnergyRefill().toLocalDateTime() : null)
            .pointsUser(user.getPointsUser())
            .role(user.getRole())
            .build();
    }
}
