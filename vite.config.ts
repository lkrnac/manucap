import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import dts from "vite-plugin-dts";

export default defineConfig(({ mode }) => ({
    plugins: [react(), dts()],
    build: mode === "development"
        ? undefined
        : {
            lib: {
                entry: path.resolve(__dirname, "src/indexLibrary.ts"),
                name: "ManuCap",
                fileName: "manucap",
                formats: ["es", "cjs"]
            },
            rollupOptions: {
                external: ["react", "react-dom"],
                output: {
                    globals: {
                        react: "React",
                        "react-dom": "ReactDOM"
                    }
                }
            }
        },
    define: {
        global: "window", // Polyfill `global` as `window` in the browser
        process: {
            env: {
                NODE_ENV: mode === "development" ? "development" : "production", // Polyfill process.env.NODE_ENV
            },
        },
    },
    root: mode === "development" ? "dev" : undefined,
    server: {
        open: true
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
}));
