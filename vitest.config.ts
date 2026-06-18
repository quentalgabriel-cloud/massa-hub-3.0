import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

// Testes de dominio rodam SEM banco e SEM rede (ambiente node puro).
// Ver AGENTS.md secao 4: dominio primeiro, isolavel e testavel.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@dominio": resolve(__dirname, "./src/domain"),
      "@aplicacao": resolve(__dirname, "./src/application"),
      "@infra": resolve(__dirname, "./src/infrastructure"),
    },
  },
});
