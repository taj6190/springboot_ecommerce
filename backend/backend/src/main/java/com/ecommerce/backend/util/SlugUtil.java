package com.ecommerce.backend.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * SlugUtil
 *
 * Utility class for generating SEO-friendly URL slugs from text.
 *
 * Used across the system for:
 * - Product URLs
 * - Category URLs
 * - Brand URLs
 * - Any SEO-related routing identifiers
 *
 * Supports both English and Unicode input (including Bangla text).
 */
public final class SlugUtil {

    /**
     * Removes all characters except word characters and hyphens.
     */
    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");

    /**
     * Replaces whitespace with hyphens.
     */
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    /**
     * Removes leading and trailing hyphens.
     */
    private static final Pattern EDGE_DASHES = Pattern.compile("(^-|-$)");

    /**
     * Collapses multiple consecutive hyphens into a single hyphen.
     */
    private static final Pattern MULTIPLE_DASHES = Pattern.compile("-{2,}");

    /**
     * Utility class should not be instantiated.
     */
    private SlugUtil() {
    }

    /**
     * Generates a URL-friendly slug from the given input string.
     *
     * Steps:
     * 1. Normalize Unicode characters
     * 2. Replace spaces with hyphens
     * 3. Remove invalid characters
     * 4. Clean duplicate or edge hyphens
     * 5. Convert to lowercase
     *
     * Works with both English and Bangla/Unicode text.
     */
    public static String toSlug(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }

        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        String slug = WHITESPACE.matcher(normalized).replaceAll("-");
        slug = NON_LATIN.matcher(slug).replaceAll("");
        slug = MULTIPLE_DASHES.matcher(slug).replaceAll("-");
        slug = EDGE_DASHES.matcher(slug).replaceAll("");

        return slug.toLowerCase(Locale.ENGLISH);
    }

    /**
     * Generates a unique slug by checking against existing values.
     *
     * If a slug already exists, appends incremental suffix:
     * example-product → example-product-1 → example-product-2
     */
    public static String toUniqueSlug(String input, java.util.function.Predicate<String> existsCheck) {
        String baseSlug = toSlug(input);

        if (baseSlug.isEmpty()) {
            baseSlug = "item";
        }

        String slug = baseSlug;
        int counter = 1;

        while (existsCheck.test(slug)) {
            slug = baseSlug + "-" + counter;
            counter++;
        }

        return slug;
    }
}