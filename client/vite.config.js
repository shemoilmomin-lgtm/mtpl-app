import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { readFileSync } from 'fs'

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)))

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(version),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})