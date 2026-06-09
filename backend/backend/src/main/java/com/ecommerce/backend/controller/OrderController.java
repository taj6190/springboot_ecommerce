package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.ApiResponse;
import com.ecommerce.backend.dto.order.OrderRequest;
import com.ecommerce.backend.dto.order.OrderResponse;
import com.ecommerce.backend.dto.order.OrderStatusUpdateRequest;
import com.ecommerce.backend.enums.OrderStatus;
import com.ecommerce.backend.security.CustomUserDetails;
import com.ecommerce.backend.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order management")
public class OrderController {

    private final OrderService orderService;

    // --- Customer endpoints ---

    @PostMapping("/orders")
    @Operation(summary = "Place a new order")
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(
            @AuthenticationPrincipal CustomUserDetails user,
            @Valid @RequestBody OrderRequest request) {
        OrderResponse response = orderService.placeOrder(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Order placed", response));
    }

    @PostMapping("/public/orders")
    @Operation(summary = "Place a guest order")
    public ResponseEntity<ApiResponse<OrderResponse>> placeGuestOrder(@Valid @RequestBody OrderRequest request) {
        OrderResponse response = orderService.placeOrder(null, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Guest order placed", response));
    }

    @GetMapping("/orders")
    @Operation(summary = "Get my orders")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal CustomUserDetails user,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrdersByUser(user.getId(), pageable)));
    }

    @GetMapping("/orders/{orderNumber}")
    @Operation(summary = "Get order by order number")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(@PathVariable String orderNumber) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderByNumber(orderNumber)));
    }

    // --- Admin endpoints ---

    @GetMapping("/admin/orders")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER')")
    @Operation(summary = "Get all orders (admin)")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getAllOrders(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getAllOrders(pageable)));
    }

    @GetMapping("/admin/orders/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER')")
    @Operation(summary = "Get orders by status")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getByStatus(
            @PathVariable OrderStatus status, @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrdersByStatus(status, pageable)));
    }

    @PatchMapping("/admin/orders/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER')")
    @Operation(summary = "Update order status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody OrderStatusUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(ApiResponse.success("Order status updated",
                orderService.updateOrderStatus(id, request, user.getEmail())));
    }
}
