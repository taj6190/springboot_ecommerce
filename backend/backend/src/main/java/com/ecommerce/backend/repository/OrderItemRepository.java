package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Order Item Repository
 *
 * Provides database access operations for the OrderItem entity.
 */
@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {

    /**
     * Finds all order items associated with a given order UUID.
     *
     * @param orderId unique order UUID
     * @return list of matching order items
     */
    List<OrderItem> findByOrderId(UUID orderId);

    /**
     * Aggregates and retrieves products sorted by total units sold (for delivered orders only).
     *
     * @return a list of object arrays containing product ID at index 0 and sum of quantities at index 1
     */
    @Query("SELECT oi.product.id, SUM(oi.quantity) as totalSold FROM OrderItem oi " +
            "WHERE oi.order.status = 'DELIVERED' GROUP BY oi.product.id ORDER BY totalSold DESC")
    List<Object[]> findTopSellingProducts();

    /**
     * Checks if a user has ordered a specific product (used for review verification).
     *
     * @param userId unique user UUID
     * @param productId unique product UUID
     * @return true if an order exists, false otherwise
     */
    boolean existsByOrderUserIdAndProductId(UUID userId, UUID productId);
}
