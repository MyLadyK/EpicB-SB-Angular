package com.epicbattle.epicb_api.dto;

import lombok.Data;

@Data
public class UserDto {
    private String nameUser;
    private String mailUser;
    private String passwordHash;
}
