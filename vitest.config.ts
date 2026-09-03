import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        environment: "node",
        globals: true,
        exclude: [
            'dist',
            'node_modules'
        ],
        env: {
            DATABASE_URL: ":memory:",
            JWT_SECRET: "test-jwt-secret",
            HASH_SECRET: "test-hash-secret-32chars!!!!!!!!",
        },
    },
});