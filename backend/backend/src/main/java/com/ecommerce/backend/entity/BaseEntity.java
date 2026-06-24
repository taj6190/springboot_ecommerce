package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * BaseEntity
 *
 * This is a mapped superclass that provides common fields for all entities
 * in the system. It helps eliminate duplication and ensures consistency
 * across all database entities.
 *
 * Features included:
 * - Primary key (UUID)
 * - Automatic auditing (created/updated timestamps)
 * - User tracking (createdBy / updatedBy)
 *
 * Requires Spring Data JPA Auditing to be enabled.
 */
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
public abstract class BaseEntity {

    /**
     * Unique identifier for all entities.
     * Generated automatically using UUID strategy.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    /**
     * Timestamp when the entity was first created.
     * Automatically managed by Spring Data JPA auditing.
     * This value will never change after insertion.
     */
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    /**
     * Timestamp when the entity was last updated.
     * Automatically updated whenever the entity is modified.
     */
    @LastModifiedDate
    @Column(nullable = false)
    private Instant updatedAt;

    /**
     * Username or identifier of the user who created the entity.
     * Populated automatically via auditing configuration.
     */
    @CreatedBy
    @Column(updatable = false)
    private String createdBy;

    /**
     * Username or identifier of the user who last modified the entity.
     * Updated automatically on each update operation.
     */
    @LastModifiedBy
    private String updatedBy;
}