import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // 這裡的路徑必須與 GitHub 倉庫名一致，通常也就等於你的 package name
  base: '/GatheringFun/',
  server: {
    port: 3000,
    open: true
  }
})