package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.OrderStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Order Status History Repository
 *
 * Provides database access operations for the OrderStatusHistory entity.
 */
@Repository
public interface OrderStatusHistoryRepository extends JpaRepository<OrderStatusHistory, UUID> {

    /**
     * Retrieves status change logs associated with an order, sorted from newest to oldest.
     *
     * @param orderId unique order UUID
     * @return list of status history entries
     */
    List<OrderStatusHistory> findByOrderIdOrderByChangedAtDesc(UUID orderId);
}
