import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";

import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import { resolve } from 'path'
import { readFileSync } from 'fs'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

// Plugin to serve index.dev.html for development
const devHtmlPlugin = (): PluginOption => ({
  name: 'dev-html-plugin',
  configureServer(server) {
    return () => {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/' || req.url === '/index.html') {
          const devHtmlPath = resolve(projectRoot, 'index.dev.html')
          const html = readFileSync(devHtmlPath, 'utf-8')
          res.setHeader('Content-Type', 'text/html')
          res.end(html)
          return
        }
        next()
      })
    }
  }
})

// https://vite.dev/config/
export default defineConfig({
  base: './', // Use relative paths for assets
  plugins: [
    react(),
    tailwindcss(),
    devHtmlPlugin() as PluginOption,
    // DO NOT REMOVE
    createIconImportProxy() as PluginOption,
    sparkPlugin() as PluginOption,
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(projectRoot, 'index.dev.html')
      }
    }
  }
});
