package com.epicbattle.epicb_api.repository;

import com.epicbattle.epicb_api.model.SurprisePackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SurprisePackageRepository extends JpaRepository <SurprisePackage, Integer> {
}
