import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001, // YENİ: Frontend artık burada çalışacak
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // HEDEF: İstekleri Backend'e (3000) yönlendir
        changeOrigin: true,
        secure: false,
      },
    },
  },
})