import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    // Bind IPv4 so http://127.0.0.1:5173 works on Windows (Vite may otherwise listen on [::1] only).
    host: '127.0.0.1',
  },
})
