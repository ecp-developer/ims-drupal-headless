import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/offices': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/jsonapi': {
        target: 'https://ims-drupal-headless.ddev.site',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      },
      '/session': {
        target: 'https://ims-drupal-headless.ddev.site',
        changeOrigin: true,
        secure: false
      },
      '/api': {
        target: 'https://ims-drupal-headless.ddev.site',
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => path.replace(/^\/api/, '')
      }
    }
  }
})
