// src/main.ts
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from "./router"
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from "pinia-plugin-persistedstate"
import { permission } from "./directive/permission"
import * as ElementPlusIconsVue from "@element-plus/icons-vue"

// 1. 先创建实例
const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 2. 注册组件和指令
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.directive('permission', permission)

// 3. 关键：先安装 Pinia
app.use(pinia)

// 4. 关键：在 Pinia 之后手动执行守卫注册（防止 import 提升导致的 Pinia 报错）
import { setupRouterGuard } from './router/guard'
setupRouterGuard() 

// 5. 最后安装路由并挂载
app.use(router)
app.mount('#app')
