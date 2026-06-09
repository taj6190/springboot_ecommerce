package com.ecommerce.backend.service;

import com.ecommerce.backend.repository.OrderItemRepository;
import com.ecommerce.backend.repository.OrderRepository;
import com.ecommerce.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;

    private static final ZoneId BD_ZONE = ZoneId.of("Asia/Dhaka");

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardSummary() {
        Map<String, Object> summary = new LinkedHashMap<>();

        // Today's stats
        Instant todayStart = LocalDate.now(BD_ZONE).atStartOfDay(BD_ZONE).toInstant();
        Instant todayEnd = todayStart.plus(Duration.ofDays(1));

        summary.put("todayOrders", orderRepository.countOrdersBetween(todayStart, todayEnd));
        summary.put("todayRevenue", orderRepository.calculateRevenueBetween(todayStart, todayEnd));

        // This month
        LocalDate firstOfMonth = LocalDate.now(BD_ZONE).withDayOfMonth(1);
        Instant monthStart = firstOfMonth.atStartOfDay(BD_ZONE).toInstant();
        summary.put("monthOrders", orderRepository.countOrdersBetween(monthStart, todayEnd));
        summary.put("monthRevenue", orderRepository.calculateRevenueBetween(monthStart, todayEnd));

        // Order status summary
        List<Object[]> statusCounts = orderRepository.getOrderStatusSummary();
        Map<String, Long> statusMap = statusCounts.stream()
                .collect(Collectors.toMap(
                        row -> row[0].toString(),
                        row -> (Long) row[1],
                        (a, b) -> a,
                        LinkedHashMap::new
                ));
        summary.put("ordersByStatus", statusMap);

        // Low stock count
        summary.put("lowStockProducts", productRepository.findLowStockProducts().size());

        return summary;
    }

    @Transactional(readOnly = true)
    public Map<String, BigDecimal> getRevenueByPeriod(String period) {
        Map<String, BigDecimal> revenue = new LinkedHashMap<>();
        LocalDate today = LocalDate.now(BD_ZONE);

        int days = switch (period) {
            case "weekly" -> 7;
            case "monthly" -> 30;
            default -> 7;
        };

        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            Instant start = date.atStartOfDay(BD_ZONE).toInstant();
            Instant end = start.plus(Duration.ofDays(1));
            BigDecimal dayRevenue = orderRepository.calculateRevenueBetween(start, end);
            revenue.put(date.toString(), dayRevenue);
        }

        return revenue;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTopSellingProducts(int limit) {
        return orderItemRepository.findTopSellingProducts().stream()
                .limit(limit)
                .map(row -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    UUID productId = (UUID) row[0];
                    item.put("productId", productId);
                    item.put("totalSold", row[1]);
                    productRepository.findById(productId).ifPresent(p -> {
                        item.put("productName", p.getNameEn());
                        item.put("sku", p.getSku());
                    });
                    return item;
                })
                .collect(Collectors.toList());
    }
}
