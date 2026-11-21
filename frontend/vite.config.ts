import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * PWA ciudadana de Emergencias 168.
 *
 * El service worker precachea la aplicacion completa para que abra sin cobertura:
 * quien necesita una ambulancia no puede quedarse mirando una pagina en blanco.
 * Las llamadas a la API nunca se cachean aqui (NetworkOnly implicito); los datos
 * que deben sobrevivir sin conexion (sesion, centros de salud) se guardan aparte.
 */
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Emergencias 168',
        short_name: 'Emergencias 168',
        description: 'Linea gratuita de emergencias medicas del departamento de Oruro',
        id: '/',
        lang: 'es',
        categories: ['medical', 'health'],
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F5F7FA',
        theme_color: '#0AA7A5',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,ttf,woff2,svg}'],
        navigateFallback: '/index.html',
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            // Teselas y estilo del mapa: se reutilizan si se pierde la conexion.
            urlPattern: ({ url }) => url.hostname.endsWith('openfreemap.org'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'mapa',
              expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 14 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  // El worker de MapLibre es un modulo ES (new Worker(url, { type: 'module' })).
  worker: {
    format: 'es',
  },
  build: {
    // maplibre-gl pesa ~800 KB y va en su propio chunk, cargado solo en el mapa.
    chunkSizeWarningLimit: 1200,
  },
  // host: true expone el servidor en la red local para abrirlo desde el celular.
  server: {
    port: 3001,
    host: true,
  },
  preview: {
    port: 3001,
    host: true,
  },
});
