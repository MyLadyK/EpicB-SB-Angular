package com.epicbattle.epicb_api.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SurprisePackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int idSurprisePackage;

    private String description;
    private String modificationType;
    private int modificationValue;
}

