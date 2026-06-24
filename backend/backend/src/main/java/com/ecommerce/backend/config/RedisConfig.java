package com.ecommerce.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

/**
 * Redis Configuration
 *
 * Provides caching support for high-performance data access.
 *
 * Used for caching:
 * - Hot products
 * - Categories
 * - Brands
 * - Homepage sections
 * - Frequently accessed API responses
 *
 * This reduces database load and improves response time significantly.
 *
 * Note:
 * Redis connection must be properly configured before enabling @Configuration.
 */
// @Configuration  -- Disabled until Redis is properly configured
@EnableCaching
public class RedisConfig {

    /**
     * RedisTemplate configuration for low-level Redis operations.
     *
     * Provides:
     * - Key/value serialization
     * - JSON-based object storage
     * - Support for complex Java objects
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {

        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // Configure ObjectMapper for proper Java 8 date/time support
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        // JSON serializer for Redis values
        GenericJackson2JsonRedisSerializer jsonSerializer =
                new GenericJackson2JsonRedisSerializer(objectMapper);

        // Key serialization as plain strings
        template.setKeySerializer(new StringRedisSerializer());

        // Value serialization as JSON
        template.setValueSerializer(jsonSerializer);

        // Hash key serialization as strings
        template.setHashKeySerializer(new StringRedisSerializer());

        // Hash value serialization as JSON
        template.setHashValueSerializer(jsonSerializer);

        template.afterPropertiesSet();

        return template;
    }

    /**
     * Redis Cache Manager configuration.
     *
     * Defines:
     * - Default TTL (Time To Live)
     * - Cache-specific expiration policies
     * - Serialization rules
     *
     * Different cache regions are tuned based on update frequency:
     * - Products: short TTL (frequent updates)
     * - Categories/Brands: longer TTL (rare changes)
     * - Homepage: medium TTL
     */
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        GenericJackson2JsonRedisSerializer jsonSerializer =
                new GenericJackson2JsonRedisSerializer(objectMapper);

        // Default cache configuration (30 minutes TTL)
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(30))
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(jsonSerializer))
                .disableCachingNullValues();

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)

                // Category cache (rarely changes)
                .withCacheConfiguration("categories",
                        defaultConfig.entryTtl(Duration.ofHours(2)))

                // Brand cache (rarely changes)
                .withCacheConfiguration("brands",
                        defaultConfig.entryTtl(Duration.ofHours(2)))

                // Product cache (frequent updates)
                .withCacheConfiguration("products",
                        defaultConfig.entryTtl(Duration.ofMinutes(15)))

                // Homepage cache (medium update frequency)
                .withCacheConfiguration("homepage",
                        defaultConfig.entryTtl(Duration.ofHours(1)))

                .build();
    }
}