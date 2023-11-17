import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
	server: {
		headers: {
			'Cross-Origin-Opener-Policy': 'same-origin',
			'Cross-Origin-Embedder-Policy': 'require-corp',
		},
		proxy: {//http://localhost:3000/illumass/public/browser-sqlite-storage-worker.js
      // string shorthand: /foo -> http://localhost:4567/foo
      '/api/plugin-proxy/illumass-app': {
				target: 'https://crescent-point.sys-test.tokuindustry.com',
				changeOrigin: true,
				// set cookie header in proxy request
				ws: true,
				configure: (proxy) => {
					proxy.on('error', (err) => {
						console.log('proxy error', err);
					});
					proxy.on('proxyReq', (proxyReq, req) => {
						proxyReq.setHeader('Cookie', 'grafana_session=6a0ec4f8814f166baa5996e448936c55');
						console.log('Sending Request to the Target:', req.method, req.url);
					});
					proxy.on('proxyRes', (proxyRes, req) => {
						console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
					});
				},
			},
		}
	},
	optimizeDeps: {
		exclude: ['@sqlite.org/sqlite-wasm'],
	},
})
