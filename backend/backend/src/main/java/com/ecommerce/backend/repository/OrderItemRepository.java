package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {
    List<OrderItem> findByOrderId(UUID orderId);

    @Query("SELECT oi.product.id, SUM(oi.quantity) as totalSold FROM OrderItem oi " +
            "WHERE oi.order.status = 'DELIVERED' GROUP BY oi.product.id ORDER BY totalSold DESC")
    List<Object[]> findTopSellingProducts();

    boolean existsByOrderUserIdAndProductId(UUID userId, UUID productId);
}
