import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react({
    babel: {
      plugins: [
        '@babel/plugin-transform-runtime',
        '@babel/plugin-proposal-optional-chaining'
      ]
    },
    // Improve JSX transformation
    jsxRuntime: 'automatic'
  })],
  resolve: {
    alias: {
      '@': '/src',
    },
    // Prioritize ESM over CommonJS
    mainFields: ['module', 'jsnext:main', 'jsnext', 'browser', 'main'],
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      '@mui/material',
      '@mui/system',
      '@emotion/react',
      '@emotion/styled'
    ],
    esbuildOptions: {
      target: 'es2020'
    }
  },
server: {
  host: '0.0.0.0',            // Allow access from external network (Docker, LAN etc.)
  port: 5176,                 // Your desired port
  strictPort: true,          // Don't fallback to another port if 5176 is busy
  open: false,               // Prevent auto browser opening
  allowedHosts: ['aae.alagappainfotech.com'], // Optional — usually used in dev behind a proxy
  proxy: {
    '/api': {
      target: 'https://api.alagappainfotech.com', // ✅ Use https if your backend has SSL
      changeOrigin: true,
      secure: false, // ✅ Accept self-signed SSL certificates
      rewrite: path => path.replace(/^\/api/, '') // ✅ optional: if Django doesn’t expect /api/
    }
  }
},
  build: {
    target: ['es2020', 'safari14'],
    commonjsOptions: {
      // Improve CommonJS interoperability
      transformMixedEsModules: true,
      include: [/node_modules/]
    }
  }
});
