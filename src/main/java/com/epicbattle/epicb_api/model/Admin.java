package com.epicbattle.epicb_api.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("ADMIN")
public class Admin extends User {
    // Consider adding specific fields or methods for the Admin class if needed.
}
