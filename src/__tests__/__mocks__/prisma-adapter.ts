// Stub so Jest can resolve the ESM-only @auth/prisma-adapter package.
// The actual jest.mock() factory in auth.test.ts overrides this at runtime.
export const PrismaAdapter = () => ({});
