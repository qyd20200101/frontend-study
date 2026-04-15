import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import  viteCompression from "vite-plugin-compression";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    viteCompression({
      verbose: true,        // 是否在控制台输出压缩结果
      disable: false,       // 是否禁用
      threshold: 10240,     // 只有文件大于 10KB 才会压缩
      algorithm: 'gzip',    // 压缩算法
      ext: '.gz',           // 生成的文件后缀
    }),
    AutoImport({
      resolvers:[ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
   build:{
    // 3. 2.5年经验必备：分包策略，防止一个 vendor.js 撑爆首屏
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // 将 echarts 独立拆包
            if (id.includes('echarts')) {
              return 'echarts-vendor';
            }
            // 将 element-plus 独立拆包
            if (id.includes('element-plus')) {
              return 'element-plus-vendor';
            }
            // 其他所有第三方库合在一起
            return 'vendor';
          }
      }
    }
  },
},
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
