package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.ApiResponse;
import com.ecommerce.backend.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Report Controller
 *
 * Exposes endpoints for admin dashboard analytics and reports.
 * Restricted strictly to users with the ADMIN role.
 * Includes sales reports, top products, and revenue breakdowns.
 */
@RestController
@RequestMapping("/admin/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Reports", description = "Admin reports & analytics")
public class ReportController {

    /**
     * Service handling the business logic for calculating analytical metrics.
     */
    private final ReportService reportService;

    /**
     * Retrieves high-level dashboard metrics (e.g. total users, total orders, total sales, pending reviews).
     *
     * @return a ResponseEntity containing the dashboard analytical summary map
     */
    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getDashboardSummary()));
    }

    /**
     * Retrieves aggregated revenue data grouped by a calendar period.
     *
     * @param period the reporting division period, either "weekly" or "monthly"
     * @return a ResponseEntity containing key-value pairs of periods and their corresponding revenue amounts
     */
    @GetMapping("/revenue")
    @Operation(summary = "Get revenue by period (weekly/monthly)")
    public ResponseEntity<ApiResponse<Map<String, BigDecimal>>> getRevenue(
            @RequestParam(defaultValue = "weekly") String period) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getRevenueByPeriod(period)));
    }

    /**
     * Retrieves a list of top-selling products based on quantity ordered.
     *
     * @param limit maximum number of products to return
     * @return a ResponseEntity containing the list of top-selling products and their sales metrics
     */
    @GetMapping("/top-products")
    @Operation(summary = "Get top selling products")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTopProducts(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getTopSellingProducts(limit)));
    }
}
