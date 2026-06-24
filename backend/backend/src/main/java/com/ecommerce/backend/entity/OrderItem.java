package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * OrderItem Entity
 *
 * Represents a single line item inside an order.
 * Each order can contain multiple products and variants.
 *
 * This entity stores a snapshot of product data at purchase time
 * to ensure historical consistency even if product data changes later.
 */
@Entity
@Table(name = "order_items", indexes = {
        @Index(name = "idx_order_item_order", columnList = "order_id"),
        @Index(name = "idx_order_item_product", columnList = "product_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem extends BaseEntity {

    /**
     * Parent order to which this item belongs.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    /**
     * Product purchased in this order item.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /**
     * Optional product variant (e.g., size, color).
     * Nullable if product has no variants.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id")
    private ProductVariant variant;

    /**
     * Product name snapshot at the time of purchase.
     * Preserved to maintain historical accuracy.
     */
    @Column(nullable = false, length = 300)
    private String productName;

    /**
     * Variant information snapshot (e.g., "Red, XL").
     */
    @Column(length = 100)
    private String variantInfo;

    /**
     * Stock Keeping Unit (SKU) identifier at purchase time.
     */
    @Column(nullable = false, length = 100)
    private String sku;

    /**
     * Quantity of this product ordered.
     */
    @Column(nullable = false)
    private Integer quantity;

    /**
     * Unit price of the product at time of purchase.
     */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    /**
     * Total price for this line item (unitPrice × quantity).
     */
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal totalPrice;

    /**
     * Image URL snapshot of the product at purchase time.
     */
    private String imageUrl;
}