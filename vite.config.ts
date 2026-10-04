import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";
import vitePluginBundleObfuscator from "vite-plugin-bundle-obfuscator";

const minimizeObfuscatorConfig = {
  autoExcludeNodeModules: { enable: true, manualChunks: ["react"] },
  threadPool: { enable: true, size: 4 },
};

export default defineConfig({
  plugins: [nitro(), vitePluginBundleObfuscator(minimizeObfuscatorConfig)],
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    build: {
      chunkSizeWarningLimit: 10000,
      ssr: true,
      sourcemap: false,
    },
    resolve: {
      alias: {
        "@": "/src",
      },
      tsconfigPaths: true,
    },
  },
});
