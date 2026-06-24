package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Payment;
import com.ecommerce.backend.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Payment Repository
 *
 * Provides database access operations for the Payment entity.
 */
@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    /**
     * Finds the payment transaction details associated with an order UUID.
     *
     * @param orderId unique order UUID
     * @return an Optional containing the payment if found
     */
    Optional<Payment> findByOrderId(UUID orderId);

    /**
     * Counts the total number of payment transactions in a given status.
     *
     * @param status the PaymentStatus to count
     * @return count of transactions
     */
    long countByStatus(PaymentStatus status);
}
