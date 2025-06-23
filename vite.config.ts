import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/' : './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          xterm: ['@xterm/xterm', '@xterm/addon-fit', '@xterm/addon-web-links']
        }
      }
    }
  },
  server: {
    port: 5173,
    open: true
  },
  optimizeDeps: {
    exclude: ['./src/pkg/portfolio_commands.js']
  }
}))