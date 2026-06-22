/**
 * Environment Configuration
 *
 * This file centralizes all environment variable handling for the application.
 * It provides direct access to environment variables with default fallbacks.
 */

// Environment configuration object with default values
export const env = {
    // Node environment
    NODE_ENV: process.env.NODE_ENV || "development",

    // API Configuration
    NEXT_PUBLIC_AUTOLOKATE_API_BASE_URL:
        process.env.NEXT_PUBLIC_AUTOLOKATE_API_BASE_URL ||
        "https://autolokate-api-staging-2j5tqz76xa-el.a.run.app",


    // Site Configuration
    NEXT_PUBLIC_SITE_URL:
        process.env.NEXT_PUBLIC_SITE_URL ||
        (typeof window !== "undefined"
            ? window.location.origin
            : "https://autolokate-api-staging-2j5tqz76xa-el.a.run.app"),

};

// Environment checks
export const isDevelopment = env.NODE_ENV === "development";
export const isProduction = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";
