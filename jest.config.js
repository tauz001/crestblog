const nextJest = require("next/jest")

const createJestConfig = nextJest({
  dir: "./",
})

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // Important for Next.js 13+
  testEnvironment: "jest-environment-jsdom",

  moduleNameMapper: {
    // Handle module aliases
    "^@/(.*)$": "<rootDir>/$1",
    "^@/app/(.*)$": "<rootDir>/app/$1",
    "^@/src/(.*)$": "<rootDir>/src/$1",

    // Handle CSS imports (with CSS modules)
    "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",

    // Handle CSS imports (without CSS modules)
    "^.+\\.(css|sass|scss)$": "<rootDir>/__mocks__/styleMock.js",

    // Handle image imports
    "^.+\\.(jpg|jpeg|png|gif|webp|avif|svg)$": "<rootDir>/__mocks__/fileMock.js",
  },

  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "src/**/*.{js,jsx,ts,tsx}",
    "!app/**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
    "!**/coverage/**",
    "!**/layout.{js,jsx,ts,tsx}", // Skip layouts
    "!**/loading.{js,jsx,ts,tsx}", // Skip loading components
    "!**/error.{js,jsx,ts,tsx}", // Skip error components
  ],

  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],

  testPathIgnorePatterns: ["/node_modules/", "/.next/", "/e2e/", "/playwright-report/"],

  transformIgnorePatterns: ["/node_modules/", "^.+\\.module\\.(css|sass|scss)$"],

  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Important for Next.js 13+
  moduleDirectories: ["node_modules", "<rootDir>/"],

  testEnvironmentOptions: {
    customExportConditions: [""],
  },
}

module.exports = createJestConfig(customJestConfig)
