package com.ecommerce.backend.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Utility class for generating URL-friendly slugs from text.
 */
public final class SlugUtil {

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");
    private static final Pattern EDGE_DASHES = Pattern.compile("(^-|-$)");
    private static final Pattern MULTIPLE_DASHES = Pattern.compile("-{2,}");

    private SlugUtil() {
    }

    /**
     * Generates a slug from the given input string.
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
     * Generates a unique slug by appending a suffix if needed.
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
