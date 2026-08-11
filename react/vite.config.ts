import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: process.platform === 'win32'
        ? (file) => {
            const rel = path.relative(process.cwd(), file);
            return rel.startsWith('backend') || rel.startsWith('data');
          }
        : ['**/backend/**', '**/data/**']
    }
  },
})
