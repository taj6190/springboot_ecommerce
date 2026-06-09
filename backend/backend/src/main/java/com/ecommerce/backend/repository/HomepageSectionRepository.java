package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.HomepageSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface HomepageSectionRepository extends JpaRepository<HomepageSection, UUID> {
    List<HomepageSection> findByActiveTrueOrderByDisplayOrderAsc();
}
