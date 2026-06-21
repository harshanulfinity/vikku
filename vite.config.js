import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('react-dom') || id.includes('react-router-dom') || (id.includes('node_modules/react/') )) return 'vendor-react'
          if (id.includes('@supabase')) return 'vendor-supabase'
          if (id.includes('lucide-react')) return 'vendor-lucide'
        },
      },
    },
  },
})
