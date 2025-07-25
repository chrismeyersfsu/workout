import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    allowedHosts: true
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})
