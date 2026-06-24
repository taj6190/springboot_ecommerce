package com.ecommerce.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.web.config.EnableSpringDataWebSupport;

import static org.springframework.data.web.config.EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO;

/**
 * Data Web Configuration
 *
 * Configures Spring Data Web support for REST APIs.
 *
 * The VIA_DTO page serialization mode ensures that Spring Data Page
 * objects are serialized into a stable DTO representation instead of
 * exposing internal Page implementation details.
 *
 * Benefits:
 * - Cleaner API responses
 * - Better frontend compatibility
 * - Reduced coupling to Spring internal classes
 * - More stable API contracts across Spring Boot upgrades
 */
@Configuration
@EnableSpringDataWebSupport(pageSerializationMode = VIA_DTO)
public class DataWebConfig {
}