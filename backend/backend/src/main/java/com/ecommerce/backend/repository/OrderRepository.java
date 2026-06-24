package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Order;
import com.ecommerce.backend.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Order Repository
 *
 * Provides database access operations for the Order entity.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    /**
     * Finds an order by its unique human-readable order number.
     *
     * @param orderNumber unique order number string
     * @return an Optional containing the order if found
     */
    Optional<Order> findByOrderNumber(String orderNumber);

    /**
     * Retrieves a page of orders associated with a user, sorted newest first.
     *
     * @param userId unique user UUID
     * @param pageable pagination parameters
     * @return page of orders
     */
    Page<Order> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    /**
     * Retrieves a page of orders filtered by status, sorted newest first.
     *
     * @param status order status state
     * @param pageable pagination parameters
     * @return page of orders
     */
    Page<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status, Pageable pageable);

    /**
     * Counts the total number of orders in a given status.
     *
     * @param status the OrderStatus to count
     * @return count of orders
     */
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    long countByStatus(@Param("status") OrderStatus status);

    /**
     * Calculates the sum of total amounts for delivered orders placed within a timeframe.
     *
     * @param start start timestamp (inclusive)
     * @param end end timestamp (inclusive)
     * @return sum of total revenue
     */
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'DELIVERED' AND o.createdAt BETWEEN :start AND :end")
    BigDecimal calculateRevenueBetween(@Param("start") Instant start, @Param("end") Instant end);

    /**
     * Counts the number of orders placed within a timeframe.
     *
     * @param start start timestamp (inclusive)
     * @param end end timestamp (inclusive)
     * @return count of orders
     */
    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt BETWEEN :start AND :end")
    long countOrdersBetween(@Param("start") Instant start, @Param("end") Instant end);

    /**
     * Aggregates orders to get a count of orders grouped by status.
     *
     * @return list of object arrays containing order status and order count
     */
    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> getOrderStatusSummary();
}
