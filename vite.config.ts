import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [nitro()],
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    build: {
      chunkSizeWarningLimit: 10000,
      ssr: true,
      target: "esnext",
      sourcemap: false,
      minify: "esbuild",
    },
    resolve: {
      alias: {
        "@": "/src",
      },
      tsconfigPaths: true,
    },
  },
});
