// vitest.config.js
import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        globals: false,
        coverage: {
            reporter: ['text', 'html'],
        },
        environment: 'jsdom',
    },
})
