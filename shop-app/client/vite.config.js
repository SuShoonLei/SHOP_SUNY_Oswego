import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_API_PROXY_TARGET || 'http://localhost:3001'
  const proxy = {
    '/api': { target, changeOrigin: true },
  }

  return {
    // Ensure assets resolve correctly when deployed to GitHub Pages.
    base: '/',
    plugins: [react(), tailwindcss()],
    server: { proxy },
    // `vite preview` does not use server.proxy unless preview.proxy is set
    preview: { proxy },
  }
})
