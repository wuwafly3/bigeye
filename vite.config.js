import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

const root = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  base: './',
  plugins: [tailwindcss()],
  esbuild: { jsx: 'automatic' },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      input: {
        index: resolve(root, 'index.html'),
        characters: resolve(root, 'characters.html'),
        functors: resolve(root, 'functors.html'),
        character: resolve(root, 'character.html'),
        timeline: resolve(root, 'timeline.html'),
        story: resolve(root, 'story.html'),
        gallery: resolve(root, 'gallery.html'),
        enemies: resolve(root, 'enemies.html'),
        submit: resolve(root, 'submit.html')
      }
    }
  }
})
