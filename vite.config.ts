import { defineConfig } from 'vite'
import { copyFileSync } from 'fs'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ mode }) => ({
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    react(),
    {
      name: 'chrome-manifest',
      writeBundle() {
        if (mode === 'development') {
          copyFileSync('public/manifest.dev.json', 'dist/manifest.json')
        }
      },
    },
  ],
}))
