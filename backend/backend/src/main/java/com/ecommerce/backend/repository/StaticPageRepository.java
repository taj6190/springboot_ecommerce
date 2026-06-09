package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.StaticPage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface StaticPageRepository extends JpaRepository<StaticPage, UUID> {
    Optional<StaticPage> findBySlug(String slug);
    boolean existsBySlug(String slug);
}
