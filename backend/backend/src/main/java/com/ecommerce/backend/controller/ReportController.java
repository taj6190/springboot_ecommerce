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

@RestController
@RequestMapping("/admin/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Reports", description = "Admin reports & analytics")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getDashboardSummary()));
    }

    @GetMapping("/revenue")
    @Operation(summary = "Get revenue by period (weekly/monthly)")
    public ResponseEntity<ApiResponse<Map<String, BigDecimal>>> getRevenue(
            @RequestParam(defaultValue = "weekly") String period) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getRevenueByPeriod(period)));
    }

    @GetMapping("/top-products")
    @Operation(summary = "Get top selling products")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTopProducts(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getTopSellingProducts(limit)));
    }
}
