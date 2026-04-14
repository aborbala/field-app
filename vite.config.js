import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    define: {
      'process.env.VITE_CF_ANALYTICS_TOKEN': JSON.stringify(env.VITE_CF_ANALYTICS_TOKEN),
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
      },
    },
    plugins: [
      {
        name: 'html-transform',
        transformIndexHtml(html) {
          return html.replace(
            /%VITE_CF_ANALYTICS_TOKEN%/g,
            env.VITE_CF_ANALYTICS_TOKEN || ''
          )
        },
      },
    ],
  }
})
