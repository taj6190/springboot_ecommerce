package com.ecommerce.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Async email notification service.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendOrderConfirmation(String to, String orderNumber, String totalAmount) {
        sendEmail(to, "Order Confirmed - " + orderNumber,
                "Thank you for your order!\n\n" +
                        "Order Number: " + orderNumber + "\n" +
                        "Total Amount: ৳" + totalAmount + "\n\n" +
                        "We will notify you when your order is shipped.\n\n" +
                        "Thank you for shopping with BD E-Commerce!");
    }

    @Async
    public void sendOrderStatusUpdate(String to, String orderNumber, String newStatus) {
        sendEmail(to, "Order Update - " + orderNumber,
                "Your order " + orderNumber + " has been updated.\n\n" +
                        "New Status: " + newStatus + "\n\n" +
                        "Track your order in your account dashboard.\n\n" +
                        "Thank you for shopping with BD E-Commerce!");
    }

    @Async
    public void sendPaymentConfirmation(String to, String orderNumber, String amount) {
        sendEmail(to, "Payment Confirmed - " + orderNumber,
                "Your payment of ৳" + amount + " for order " + orderNumber + " has been confirmed.\n\n" +
                        "Thank you for shopping with BD E-Commerce!");
    }

    @Async
    public void sendWelcomeEmail(String to, String fullName) {
        sendEmail(to, "Welcome to BD E-Commerce!",
                "Hello " + fullName + ",\n\n" +
                        "Welcome to BD E-Commerce! Your account has been created successfully.\n\n" +
                        "Start shopping now and enjoy the best deals!\n\n" +
                        "Thank you!");
    }

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
