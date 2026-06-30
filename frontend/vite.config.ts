import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    watch: {
      ignored: [
        '**/backend/**',        
        '**/*.db',              
        '**/*.db-journal',      
        '**/*.db-wal',          
        '**/*.db-shm',          
        '**/uploads/**',        
        '**/public/reportes/**',
        '**/public/uploads/**'
      ],
    },
  },
})