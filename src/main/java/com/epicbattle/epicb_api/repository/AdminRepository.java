package com.epicbattle.epicb_api.repository;

import com.epicbattle.epicb_api.model.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRepository extends JpaRepository <Admin, Integer> {
}
