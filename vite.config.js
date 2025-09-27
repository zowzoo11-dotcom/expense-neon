import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// NOTE: set base to your repo name when deploying (e.g. '/expense-neon/')
export default defineConfig({
  plugins: [react()],
  base: '/', 
})