import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // 只要请求路径以/api开通，就转发到3000端口
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
        // 如果后端接口没有/api前缀，可以开启下面的重写逻辑
        // rewrite: (path) => path.replace(/^\/api/,'')
      }
    }
  }
})
