package com.epicbattle.epicb_api.dto;

import javax.validation.constraints.NotNull;

public class BattleRequestDTO {
    @NotNull
    private Integer user1Id;
    @NotNull
    private Integer user2Id;
    @NotNull
    private Integer userCharacter1Id;
    @NotNull
    private Integer userCharacter2Id;

    // Getters y setters
    public Integer getUser1Id() { return user1Id; }
    public void setUser1Id(Integer user1Id) { this.user1Id = user1Id; }
    public Integer getUser2Id() { return user2Id; }
    public void setUser2Id(Integer user2Id) { this.user2Id = user2Id; }
    public Integer getUserCharacter1Id() { return userCharacter1Id; }
    public void setUserCharacter1Id(Integer userCharacter1Id) { this.userCharacter1Id = userCharacter1Id; }
    public Integer getUserCharacter2Id() { return userCharacter2Id; }
    public void setUserCharacter2Id(Integer userCharacter2Id) { this.userCharacter2Id = userCharacter2Id; }
}
