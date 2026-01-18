import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 這裡的路徑必須與 GitHub 倉庫名一致，通常也就等於你的 package name
  base: '/GatheringFun/', 
  build: {
    outDir: 'dist',
    sourcemap: false, 
  }
})