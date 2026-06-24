package com.ecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Paginated response wrapper for list endpoints.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PagedResponse<T> {

    /** The list of items for the current page. */
    private List<T> content;

    /** The current page number (zero-based). */
    private int page;

    /** The number of items per page. */
    private int size;

    /** The total number of items across all pages. */
    private long totalElements;

    /** The total number of pages available. */
    private int totalPages;

    /** Whether this is the last page. */
    private boolean last;

    /** Whether this is the first page. */
    private boolean first;
}
