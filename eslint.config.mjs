import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendor agent skills installed by the Prisma, Clerk and Stripe integrations
    ".agents/**",
    ".claude/**",
    ".cursor/**",
    ".devin/**",
    // Emitted by `prisma contract emit`
    "src/prisma/contract.d.ts",
    "migrations/**/*.d.ts",
  ]),
]);

export default eslintConfig;
