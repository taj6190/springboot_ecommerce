package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Role;
import com.ecommerce.backend.enums.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Role Repository
 *
 * Provides database access operations for the Role entity.
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> {

    /**
     * Finds a security role by its Name enum.
     *
     * @param name role name enum (e.g. ROLE_CUSTOMER, ROLE_ADMIN)
     * @return an Optional containing the role if found
     */
    Optional<Role> findByName(RoleName name);

    /**
     * Checks if a security role exists with the given name.
     *
     * @param name role name enum
     * @return true if it exists, false otherwise
     */
    boolean existsByName(RoleName name);
}
