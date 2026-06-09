package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    Optional<Category> findBySlug(String slug);
    boolean existsBySlug(String slug);

    List<Category> findByParentIsNullAndActiveTrueOrderByDisplayOrderAsc();

    List<Category> findByParentIdAndActiveTrueOrderByDisplayOrderAsc(UUID parentId);

    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.children WHERE c.parent IS NULL AND c.active = true ORDER BY c.displayOrder")
    List<Category> findAllRootCategoriesWithChildren();

    List<Category> findByActiveTrue();
    long countByParentId(UUID parentId);
}
