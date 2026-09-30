import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readdirSync } from 'node:fs'

const documentIcons = {
  name: 'document-icons',
  resolveId(id) { if (id === 'virtual:document-icons') return '\0document-icons' },
  load(id) {
    if (id !== '\0document-icons') return
    const directory = new URL('./public/images/icon/', import.meta.url)
    const icons = readdirSync(directory).filter(name => /\.(png|webp|gif|jpe?g|svg|ico|bmp)$/i.test(name)).sort()
      .map(name => ({ name, url: `/images/icon/${encodeURIComponent(name)}` }))
    return `export default ${JSON.stringify(icons)}`
  },
}

export default defineConfig({
  plugins: [react(), documentIcons],
  base: '/',
  server: {
    proxy: { '/api': { target: 'http://127.0.0.1:3000', changeOrigin: true } },
  },
})
