import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables from parent directory (workspace root)
  const env = loadEnv(mode, '../', '')
  
  return {
    plugins: [react(), tailwindcss()],
    envDir: '../',
    server: {
      port: parseInt(env.FRONTEND_PORT) || 3000
    }
  }
})
