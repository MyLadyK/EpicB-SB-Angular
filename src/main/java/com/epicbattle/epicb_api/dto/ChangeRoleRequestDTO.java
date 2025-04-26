package com.epicbattle.epicb_api.dto;

import javax.validation.constraints.NotNull;

public class ChangeRoleRequestDTO {
    @NotNull
    private Integer userId;
    @NotNull
    private String newRole;

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }
    public String getNewRole() { return newRole; }
    public void setNewRole(String newRole) { this.newRole = newRole; }
}
