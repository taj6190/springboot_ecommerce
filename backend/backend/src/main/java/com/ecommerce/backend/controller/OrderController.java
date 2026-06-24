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

/**
 * Order Controller
 *
 * Exposes endpoints for managing purchase orders.
 * Handles customer/guest order placement, order history retrieval, and admin-focused status updates.
 */
@RestController
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order management")
public class OrderController {

    /**
     * Service handling the business logic for ordering, checkout, and inventory decrement.
     */
    private final OrderService orderService;

    // --- Customer endpoints ---

    /**
     * Places a new order for an authenticated customer.
     *
     * @param user details of the authenticated customer placing the order
     * @param request the order payload containing items, shipping/billing address, and payment method details
     * @return a ResponseEntity containing the placed order's details
     */
    @PostMapping("/orders")
    @Operation(summary = "Place a new order")
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(
            @AuthenticationPrincipal CustomUserDetails user,
            @Valid @RequestBody OrderRequest request) {
        OrderResponse response = orderService.placeOrder(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Order placed", response));
    }

    /**
     * Places a guest order without requiring authentication.
     *
     * @param request the guest order payload including contact email/phone, items, and address details
     * @return a ResponseEntity containing the placed order's details
     */
    @PostMapping("/public/orders")
    @Operation(summary = "Place a guest order")
    public ResponseEntity<ApiResponse<OrderResponse>> placeGuestOrder(@Valid @RequestBody OrderRequest request) {
        OrderResponse response = orderService.placeOrder(null, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Guest order placed", response));
    }

    /**
     * Retrieves the order history for the currently logged-in user with pagination support.
     *
     * @param user details of the authenticated user
     * @param pageable pagination parameters (page, size, sorting)
     * @return a ResponseEntity containing a pageable list of user's orders
     */
    @GetMapping("/orders")
    @Operation(summary = "Get my orders")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal CustomUserDetails user,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrdersByUser(user.getId(), pageable)));
    }

    /**
     * Retrieves details of a specific order by its human-readable order number.
     * This endpoint is public so customers/guests can track order status.
     *
     * @param orderNumber unique human-readable identifier of the order
     * @return a ResponseEntity containing the order details
     */
    @GetMapping("/orders/{orderNumber}")
    @Operation(summary = "Get order by order number")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(@PathVariable String orderNumber) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderByNumber(orderNumber)));
    }

    // --- Admin endpoints ---

    /**
     * Retrieves all orders placed in the system with pagination support.
     * Restricted to admin or inventory manager users.
     *
     * @param pageable pagination parameters (page, size, sorting)
     * @return a ResponseEntity containing a pageable list of all orders
     */
    @GetMapping("/admin/orders")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER')")
    @Operation(summary = "Get all orders (admin)")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getAllOrders(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getAllOrders(pageable)));
    }

    /**
     * Retrieves orders filtered by their current status (e.g. PENDING, SHIPPED).
     * Restricted to admin or inventory manager users.
     *
     * @param status the order status to filter by
     * @param pageable pagination parameters (page, size, sorting)
     * @return a ResponseEntity containing a pageable list of matching orders
     */
    @GetMapping("/admin/orders/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER')")
    @Operation(summary = "Get orders by status")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getByStatus(
            @PathVariable OrderStatus status, @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrdersByStatus(status, pageable)));
    }

    /**
     * Updates the status of an existing order and registers the status history.
     * Restricted to admin or inventory manager users.
     *
     * @param id unique UUID of the order
     * @param request the new status payload containing status and optional comments
     * @param user details of the admin/manager performing the update
     * @return a ResponseEntity containing the updated order details
     */
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
