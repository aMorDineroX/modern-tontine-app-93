import { defineConfig, configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

// Configuration commune pour tous les types de tests
const baseConfig = {
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true,
    testTimeout: 15000, // Augmenter le délai d'attente à 15 secondes
    exclude: [
      ...configDefaults.exclude,
      'cypress/**',
      'e2e/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'coverage/**',
        'dist/**',
        '**/node_modules/**',
        '**/*.d.ts',
        'test/setup.ts',
        'vitest.config.ts',
      ],
      all: true,
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
};

// Configuration spécifique en fonction du type de test
export default defineConfig(({ mode }) => {
  if (mode === 'unit') {
    return {
      ...baseConfig,
      test: {
        ...baseConfig.test,
        include: ['**/*.test.{ts,tsx}'],
        exclude: [
          ...baseConfig.test.exclude,
          '**/test/integration/**',
          '**/test/performance/**',
        ],
        coverage: {
          ...baseConfig.test.coverage,
          reportsDirectory: './coverage/unit',
        },
      },
    };
  }

  if (mode === 'integration') {
    return {
      ...baseConfig,
      test: {
        ...baseConfig.test,
        include: ['**/test/integration/**/*.test.{ts,tsx}'],
        coverage: {
          ...baseConfig.test.coverage,
          reportsDirectory: './coverage/integration',
        },
      },
    };
  }

  if (mode === 'performance') {
    return {
      ...baseConfig,
      test: {
        ...baseConfig.test,
        include: ['**/test/performance/**/*.perf.test.{ts,tsx}'],
        coverage: {
          ...baseConfig.test.coverage,
          reportsDirectory: './coverage/performance',
        },
      },
    };
  }

  // Configuration par défaut (tous les tests)
  return baseConfig;
});
