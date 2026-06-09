package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.order.*;
import com.ecommerce.backend.entity.*;
import com.ecommerce.backend.enums.OrderStatus;
import com.ecommerce.backend.enums.PaymentMethod;
import com.ecommerce.backend.enums.PaymentStatus;
import com.ecommerce.backend.exception.BadRequestException;
import com.ecommerce.backend.exception.InsufficientStockException;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final CouponRepository couponRepository;
    private final CouponService couponService;

    private static final AtomicLong orderCounter = new AtomicLong(System.currentTimeMillis() % 100000);

    /**
     * Place a new order with concurrency-safe stock deduction using pessimistic locking.
     */
    @Transactional
    public OrderResponse placeOrder(UUID userId, OrderRequest request) {
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        }

        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .user(user)
                .shippingName(request.getShippingName())
                .shippingPhone(request.getShippingPhone())
                .shippingAddress(request.getShippingAddress())
                .shippingCity(request.getShippingCity())
                .shippingDistrict(request.getShippingDistrict())
                .shippingPostalCode(request.getShippingPostalCode())
                .notes(request.getNotes())
                .couponCode(request.getCouponCode())
                .status(OrderStatus.PENDING)
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;

        for (OrderRequest.OrderItemRequest itemReq : request.getItems()) {
            // Use pessimistic lock for stock deduction
            Product product = productRepository.findByIdWithLock(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemReq.getProductId()));

            BigDecimal unitPrice;
            String variantInfo = null;
            ProductVariant variant = null;

            if (itemReq.getVariantId() != null) {
                variant = variantRepository.findByIdWithLock(itemReq.getVariantId())
                        .orElseThrow(() -> new ResourceNotFoundException("Variant", "id", itemReq.getVariantId()));

                if (variant.getStockQuantity() < itemReq.getQuantity()) {
                    throw new InsufficientStockException(product.getNameEn(), itemReq.getQuantity(), variant.getStockQuantity());
                }
                variant.setStockQuantity(variant.getStockQuantity() - itemReq.getQuantity());
                variantRepository.save(variant);

                unitPrice = variant.getDiscountPrice() != null ? variant.getDiscountPrice() : variant.getPrice();
                variantInfo = buildVariantInfo(variant);
            } else {
                if (product.getStockQuantity() < itemReq.getQuantity()) {
                    throw new InsufficientStockException(product.getNameEn(), itemReq.getQuantity(), product.getStockQuantity());
                }
                product.setStockQuantity(product.getStockQuantity() - itemReq.getQuantity());
                productRepository.save(product);

                unitPrice = product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getMainPrice();
            }

            BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            subtotal = subtotal.add(totalPrice);

            OrderItem item = OrderItem.builder()
                    .product(product)
                    .variant(variant)
                    .productName(product.getNameEn())
                    .variantInfo(variantInfo)
                    .sku(variant != null ? variant.getSku() : product.getSku())
                    .quantity(itemReq.getQuantity())
                    .unitPrice(unitPrice)
                    .totalPrice(totalPrice)
                    .imageUrl(product.getMainImageUrl())
                    .build();

            order.addItem(item);
        }

        order.setSubtotal(subtotal);

        // Apply coupon discount
        BigDecimal discount = BigDecimal.ZERO;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            discount = couponService.applyCoupon(request.getCouponCode(), subtotal);
        }
        order.setDiscountAmount(discount);

        BigDecimal shippingCost = calculateShippingCost(subtotal);
        order.setShippingCost(shippingCost);
        order.setTotalAmount(subtotal.subtract(discount).add(shippingCost));

        // Add initial status history
        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(order)
                .fromStatus(OrderStatus.PENDING)
                .toStatus(OrderStatus.PENDING)
                .changedBy(user != null ? user.getEmail() : (request.getGuestEmail() != null ? request.getGuestEmail() : "GUEST"))
                .changedAt(Instant.now())
                .notes("Order placed")
                .build();
        order.getStatusHistory().add(history);

        order = orderRepository.save(order);

        // Create COD payment record
        Payment payment = Payment.builder()
                .order(order)
                .method(PaymentMethod.COD)
                .amount(order.getTotalAmount())
                .status(PaymentStatus.PENDING)
                .build();
        paymentRepository.save(payment);

        log.info("Order placed: {} by {}", order.getOrderNumber(), user != null ? user.getEmail() : "GUEST");
        return mapToResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        return mapToResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderByNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderNumber", orderNumber));
        return mapToResponse(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getOrdersByUser(UUID userId, Pageable pageable) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getOrdersByStatus(OrderStatus status, Pageable pageable) {
        return orderRepository.findByStatusOrderByCreatedAtDesc(status, pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Transactional
    public OrderResponse updateOrderStatus(UUID orderId, OrderStatusUpdateRequest request, String updatedBy) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        OrderStatus oldStatus = order.getStatus();
        validateStatusTransition(oldStatus, request.getStatus());

        order.setStatus(request.getStatus());

        // If cancelled, restore stock
        if (request.getStatus() == OrderStatus.CANCELLED) {
            restoreStock(order);
        }

        // Update payment status on delivery
        if (request.getStatus() == OrderStatus.DELIVERED) {
            paymentRepository.findByOrderId(orderId).ifPresent(payment -> {
                payment.setStatus(PaymentStatus.CONFIRMED);
                payment.setPaidAt(Instant.now());
                paymentRepository.save(payment);
            });
        }

        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(order)
                .fromStatus(oldStatus)
                .toStatus(request.getStatus())
                .changedBy(updatedBy)
                .changedAt(Instant.now())
                .notes(request.getNotes())
                .build();
        order.getStatusHistory().add(history);

        order = orderRepository.save(order);
        log.info("Order {} status updated: {} → {}", order.getOrderNumber(), oldStatus, request.getStatus());
        return mapToResponse(order);
    }

    private void restoreStock(Order order) {
        for (OrderItem item : order.getItems()) {
            if (item.getVariant() != null) {
                ProductVariant variant = variantRepository.findByIdWithLock(item.getVariant().getId()).orElse(null);
                if (variant != null) {
                    variant.setStockQuantity(variant.getStockQuantity() + item.getQuantity());
                    variantRepository.save(variant);
                }
            } else {
                Product product = productRepository.findByIdWithLock(item.getProduct().getId()).orElse(null);
                if (product != null) {
                    product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                    productRepository.save(product);
                }
            }
        }
    }

    private void validateStatusTransition(OrderStatus from, OrderStatus to) {
        boolean valid = switch (from) {
            case PENDING -> to == OrderStatus.CONFIRMED || to == OrderStatus.CANCELLED;
            case CONFIRMED -> to == OrderStatus.PROCESSING || to == OrderStatus.CANCELLED;
            case PROCESSING -> to == OrderStatus.SHIPPED || to == OrderStatus.CANCELLED;
            case SHIPPED -> to == OrderStatus.DELIVERED || to == OrderStatus.RETURNED;
            case DELIVERED, CANCELLED, RETURNED -> false;
        };
        if (!valid) {
            throw new BadRequestException("Invalid status transition from " + from + " to " + to);
        }
    }

    private String generateOrderNumber() {
        String date = LocalDate.now(ZoneId.of("Asia/Dhaka")).format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return "BD-" + date + "-" + String.format("%05d", orderCounter.incrementAndGet() % 100000);
    }

    private BigDecimal calculateShippingCost(BigDecimal subtotal) {
        // Free shipping over 2000 BDT, otherwise 60 BDT
        return subtotal.compareTo(new BigDecimal("2000")) >= 0 ? BigDecimal.ZERO : new BigDecimal("60");
    }

    private String buildVariantInfo(ProductVariant v) {
        StringBuilder sb = new StringBuilder();
        if (v.getSize() != null) sb.append("Size: ").append(v.getSize());
        if (v.getColor() != null) { if (!sb.isEmpty()) sb.append(", "); sb.append("Color: ").append(v.getColor()); }
        if (v.getMaterial() != null) { if (!sb.isEmpty()) sb.append(", "); sb.append("Material: ").append(v.getMaterial()); }
        return sb.toString();
    }

    private OrderResponse mapToResponse(Order o) {
        return OrderResponse.builder()
                .id(o.getId()).orderNumber(o.getOrderNumber())
                .userId(o.getUser() != null ? o.getUser().getId() : null)
                .userName(o.getUser() != null ? o.getUser().getFullName() : o.getShippingName())
                .subtotal(o.getSubtotal()).discountAmount(o.getDiscountAmount())
                .shippingCost(o.getShippingCost()).totalAmount(o.getTotalAmount())
                .status(o.getStatus())
                .shippingName(o.getShippingName()).shippingPhone(o.getShippingPhone())
                .shippingAddress(o.getShippingAddress()).shippingCity(o.getShippingCity())
                .shippingDistrict(o.getShippingDistrict()).shippingPostalCode(o.getShippingPostalCode())
                .notes(o.getNotes()).couponCode(o.getCouponCode())
                .items(o.getItems().stream().map(i -> OrderResponse.OrderItemResponse.builder()
                        .id(i.getId()).productId(i.getProduct().getId())
                        .variantId(i.getVariant() != null ? i.getVariant().getId() : null)
                        .productName(i.getProductName()).variantInfo(i.getVariantInfo())
                        .sku(i.getSku()).quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice()).totalPrice(i.getTotalPrice())
                        .imageUrl(i.getImageUrl()).build()).collect(Collectors.toList()))
                .statusHistory(o.getStatusHistory().stream().map(h -> OrderResponse.OrderStatusHistoryResponse.builder()
                        .fromStatus(h.getFromStatus()).toStatus(h.getToStatus())
                        .changedBy(h.getChangedBy()).changedAt(h.getChangedAt())
                        .notes(h.getNotes()).build()).collect(Collectors.toList()))
                .createdAt(o.getCreatedAt()).updatedAt(o.getUpdatedAt())
                .build();
    }
}
