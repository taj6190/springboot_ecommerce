package com.ecommerce.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Standard API response wrapper for consistent response structure across all endpoints.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    /** Indicates whether the API operation was successful. */
    private boolean success;

    /** Human-readable message describing the result of the operation. */
    private String message;

    /** The response payload data; null on error responses. */
    private T data;

    /** The server timestamp when the response was generated. */
    private Instant timestamp;

    /**
     * Creates a success response with data and a default message.
     *
     * @param data the response payload
     * @param <T>  the type of the response payload
     * @return a success {@link ApiResponse} wrapping the data
     */
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message("Operation successful")
                .data(data)
                .timestamp(Instant.now())
                .build();
    }

    /**
     * Creates a success response with a custom message and data.
     *
     * @param message the success message
     * @param data    the response payload
     * @param <T>     the type of the response payload
     * @return a success {@link ApiResponse} wrapping the data
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(Instant.now())
                .build();
    }

    /**
     * Creates a success response with a message only (no data payload).
     *
     * @param message the success message
     * @param <T>     the type parameter (unused in this case)
     * @return a success {@link ApiResponse} with no data
     */
    public static <T> ApiResponse<T> success(String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .timestamp(Instant.now())
                .build();
    }

    /**
     * Creates an error response with the given error message.
     *
     * @param message the error message describing what went wrong
     * @param <T>     the type parameter (unused in this case)
     * @return an error {@link ApiResponse}
     */
    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .timestamp(Instant.now())
                .build();
    }
}
