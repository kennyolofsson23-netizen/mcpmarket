/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "jest-environment-node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@auth/prisma-adapter$":
      "<rootDir>/src/__tests__/__mocks__/prisma-adapter.ts",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          module: "CommonJS",
          moduleResolution: "node",
          allowImportingTsExtensions: false,
          noEmit: false,
        },
      },
    ],
  },
  testEnvironmentOptions: {
    customExportConditions: ["node", "require", "default"],
  },
  clearMocks: true,
  collectCoverageFrom: ["src/lib/**/*.ts", "!src/lib/prisma.ts"],
};

module.exports = config;
