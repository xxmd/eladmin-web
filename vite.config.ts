import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_BASE_API && env.VITE_BASE_API !== '/' ? env.VITE_BASE_API : 'http://localhost:8000'
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@crud': fileURLToPath(new URL('./src/components/Crud', import.meta.url)),
        path: 'path-browserify'
      }
    },
    server: {
      port: 8013,
      proxy: {
        ...Object.fromEntries(['/api', '/auth', '/file', '/avatar', '/druid', '/doc.html'].map(path => [path, { target, changeOrigin: true }])),
        '/webSocket': { target, changeOrigin: true, ws: true }
      }
    },
    build: { outDir: 'dist', assetsDir: 'static', sourcemap: false },
    css: { preprocessorOptions: { scss: { silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'legacy-js-api'] } } }
  }
})
