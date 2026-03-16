import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const { version } = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf-8')
) as { version: string }

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_ACTIONS
    ? `/${(process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'MyTools')}/`
    : '/',
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  plugins: [vue()],
})
