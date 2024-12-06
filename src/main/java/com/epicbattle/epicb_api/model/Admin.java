package com.epicbattle.epicb_api.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("ADMIN")
public class Admin extends User {
    // Propiedades específicas de Admin (si hay alguna)
}
