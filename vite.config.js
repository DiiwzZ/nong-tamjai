import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Framer Motion — large (~200 kB min), rarely changes
          'vendor-motion': ['motion/react', 'motion'],
          // Firebase — large (~300 kB min), rarely changes
          'vendor-firebase': [
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
          ],
        },
      },
    },
  },
})
