import { defineConfig } from "orval";

export default defineConfig({
  workshop: {
    input: {
      target: "../api/openapi.json",
    },
    output: {
      mode: "single",
      target: "./src/api/generated/hooks.ts",
      client: "react-query",
      httpClient: "axios",
      clean: true,
      override: {
        mutator: {
          path: "./src/api/client.ts",
          name: "customClient",
        },
      },
    },
  },
});
