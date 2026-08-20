import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Production builds are served from the GitHub Pages project subpath
// (https://<user>.github.io/japanese-learning/), so assets must be referenced
// under /japanese-learning/. `vite dev` stays at the root path; `vite preview`
// serves the built output, which already has the subpath baked into its asset
// URLs, so it has to use the subpath too or every asset 404s.
const subpath = '/japanese-learning/'
const baseFor = ({ command, isPreview }) =>
  command === 'build' || isPreview ? subpath : '/'

export default defineConfig((env) => ({
  base: baseFor(env),
  plugins: [
    react(),
    // Offline support: the whole course is three static files (~580 kB), so the
    // service worker precaches all of it on install and serves it cache-first.
    // Nothing here talks to the network at runtime, which is why "installed"
    // and "fully usable on a plane" are the same thing for this app.
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Spoken Japanese Crash Course',
        short_name: 'Japanese',
        description:
          'Conversational Japanese for travellers: chapters, flashcards, quizzes, ' +
          'a common-words deck and short stories — all available offline.',
        lang: 'en',
        // start_url/scope must sit under `base` or the installed app opens a
        // 404 and the service worker refuses to control the page.
        start_url: baseFor(env),
        scope: baseFor(env),
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#fffaf5',
        theme_color: '#b3242b',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          // Android crops icons to its own shape; the maskable variant keeps
          // the disc inside the 80% safe zone so nothing important is cut.
          {
            src: 'icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Workbox silently drops any file above this ceiling from the precache,
        // which for a single-bundle app means "does not work offline at all".
        // The bundle is ~550 kB against a 2 MiB default today, but it grows with
        // every chapter, so raise the ceiling rather than discover the cliff.
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Any unknown in-scope URL falls back to the app shell. Routing is
        // hash-based, so this only matters for a stray deep link.
        navigateFallback: `${baseFor(env)}index.html`,
      },
    }),
  ],
}))
