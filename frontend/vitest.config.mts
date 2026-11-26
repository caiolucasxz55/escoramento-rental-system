import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// alias igual ao `paths` do tsconfig; mudar um pede mudar o outro
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
