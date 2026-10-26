import { defineConfig, mergeConfig } from "vite";
import path from "path";
import baseConfig from "./vite.config";

/**
 * Preview the app without a Firebase project: auth and the subscription store are
 * swapped for in-memory versions from src/dev. Run it with `npm run dev:demo`.
 */
export default defineConfig((env) =>
  mergeConfig(
    typeof baseConfig === "function" ? baseConfig(env) : baseConfig,
    {
      server: { port: 8090, strictPort: true },
      resolve: {
        alias: [
          {
            find: /^@\/integrations\/firebase\/auth$/,
            replacement: path.resolve(__dirname, "./src/dev/mock-auth.tsx"),
          },
          {
            find: /^@\/integrations\/firebase\/subscriptions$/,
            replacement: path.resolve(__dirname, "./src/dev/mock-subscriptions.ts"),
          },
        ],
      },
    }
  )
);
