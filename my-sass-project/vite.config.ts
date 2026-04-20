import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import viteCompression from "vite-plugin-compression";
import { visualizer } from "rollup-plugin-visualizer";
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [
        ElementPlusResolver(),
        // 自动导入图标组件
        IconsResolver({
          prefix: 'Icon',
        }),
      ],
    }),
    // 2. 自动注册图标组件
    Components({
      resolvers: [
        ElementPlusResolver(),
        // 关键：这里告诉插件，遇到 <i-ep-xxx /> 这种组件时去 @iconify-json/ep 找
        IconsResolver({
          enabledCollections: ['ep'], // ep 代表 element-plus 的图标库
        }),
      ],
    }),
    // 3. 图标插件配置
    Icons({
      autoInstall: true,
    }),
    viteCompression({
      verbose: true, // 是否在控制台输出压缩结果
      disable: false, // 是否禁用
      threshold: 10240, // 只有文件大于 10KB 才会压缩
      algorithm: "gzip", // 压缩算法
      ext: ".gz", // 生成的文件后缀
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    //打包分析
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: "report.html",
    }),
  ],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // 将 echarts 独立拆包
            if (id.includes("echarts")) {
              return "echarts-vendor";
            }
            // 将 element-plus 独立拆包
            if (id.includes("element-plus")) {
              return "element-plus-vendor";
            }
            // 其他所有第三方库合在一起
            return "vendor";
          }
        },
        // 资源文件命名优化：让打包后的目录结构更整洁
        chunkFileNames: "static/js/[name]-[hash].js",
        entryFileNames: "static/js/[name]-[hash].js",
        assetFileNames: "static/[ext]/[name]-[hash].[ext]",
      },
    },
  },
  server: {
    proxy: {
      // 只要请求路径以/api开通，就转发到3000端口
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // 如果后端接口没有/api前缀，可以开启下面的重写逻辑
        // rewrite: (path) => path.replace(/^\/api/,'')
      },
    },
  },
});
