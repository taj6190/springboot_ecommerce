package com.ecommerce.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Email Service
 *
 * Provides async email notifications (order confirmation, status updates, payment confirmation, user welcoming).
 * Sends messages in the background utilizing Spring's task executor.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    /**
     * Interface for sending emails in Spring.
     */
    private final JavaMailSender mailSender;

    /**
     * Sends an order placement confirmation email to the customer.
     * Runs asynchronously.
     *
     * @param to recipient email address
     * @param orderNumber unique human-readable identifier of the order
     * @param totalAmount formatted total amount paid/due
     */
    @Async
    public void sendOrderConfirmation(String to, String orderNumber, String totalAmount) {
        sendEmail(to, "Order Confirmed - " + orderNumber,
                "Thank you for your order!\n\n" +
                        "Order Number: " + orderNumber + "\n" +
                        "Total Amount: ৳" + totalAmount + "\n\n" +
                        "We will notify you when your order is shipped.\n\n" +
                        "Thank you for shopping with BD E-Commerce!");
    }

    /**
     * Sends an email update when an order's status changes.
     * Runs asynchronously.
     *
     * @param to recipient email address
     * @param orderNumber unique human-readable identifier of the order
     * @param newStatus the updated status description (e.g. SHIPPED, DELIVERED)
     */
    @Async
    public void sendOrderStatusUpdate(String to, String orderNumber, String newStatus) {
        sendEmail(to, "Order Update - " + orderNumber,
                "Your order " + orderNumber + " has been updated.\n\n" +
                        "New Status: " + newStatus + "\n\n" +
                        "Track your order in your account dashboard.\n\n" +
                        "Thank you for shopping with BD E-Commerce!");
    }

    /**
     * Sends an email confirmation when a payment goes through.
     * Runs asynchronously.
     *
     * @param to recipient email address
     * @param orderNumber unique human-readable identifier of the order
     * @param amount formatted paid amount
     */
    @Async
    public void sendPaymentConfirmation(String to, String orderNumber, String amount) {
        sendEmail(to, "Payment Confirmed - " + orderNumber,
                "Your payment of ৳" + amount + " for order " + orderNumber + " has been confirmed.\n\n" +
                        "Thank you for shopping with BD E-Commerce!");
    }

    /**
     * Sends a welcoming email to newly registered users.
     * Runs asynchronously.
     *
     * @param to recipient email address
     * @param fullName the full name of the user
     */
    @Async
    public void sendWelcomeEmail(String to, String fullName) {
        sendEmail(to, "Welcome to BD E-Commerce!",
                "Hello " + fullName + ",\n\n" +
                        "Welcome to BD E-Commerce! Your account has been created successfully.\n\n" +
                        "Start shopping now and enjoy the best deals!\n\n" +
                        "Thank you!");
    }

    /**
     * Helper method to configure and dispatch simple text-based email messages.
     * Catches and logs exceptions to prevent failing operations in case mail servers are unreachable.
     *
     * @param to recipient email address
     * @param subject email subject line
     * @param text body content of the email
     */
    private void sendEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            message.setFrom("noreply@bdecommerce.com");
            mailSender.send(message);
            log.info("Email sent to {} - Subject: {}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
