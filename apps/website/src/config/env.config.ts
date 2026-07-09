/**
 * Environment Configuration
 *
 * This file centralizes all environment variable handling for the application.
 * It provides direct access to environment variables with default fallbacks.
 */

// Environment configuration object.
//
// NEXT_PUBLIC_* are inlined into the bundle at BUILD time by Next.js — real staging/prod values are
// injected as Docker build args by the deploy workflow (apps/website/Dockerfile). The defaults below are
// obvious local-dev placeholders ONLY (never a real deployed endpoint) so a build with the vars unset —
// e.g. the CI `pnpm build` compile check — still succeeds without silently baking a stale URL.
export const env = {
    // Node environment
    NODE_ENV: process.env.NODE_ENV || "development",

    // API Configuration
    NEXT_PUBLIC_AUTOLOKATE_API_BASE_URL:
        process.env.NEXT_PUBLIC_AUTOLOKATE_API_BASE_URL || "http://localhost:8080",

    // Site Configuration — prefer the injected value, then the live origin on the client, then a
    // local-dev placeholder on the server.
    NEXT_PUBLIC_SITE_URL:
        process.env.NEXT_PUBLIC_SITE_URL ||
        (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"),
};

// Environment checks
export const isDevelopment = env.NODE_ENV === "development";
export const isProduction = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";
