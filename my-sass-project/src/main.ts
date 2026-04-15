import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from "./router";
//关键：导入路由守卫
import { createPinia } from 'pinia';
import { permission } from "./directive/permission";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
const app = createApp(App);

// 在实例app上调用插件
for (const [key,component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key,component);
}
const pinia=createPinia();
app.use(router);
app.use(pinia);
pinia.use(piniaPluginPersistedstate);
import './router/guard';
app.directive('permission',permission);
app.mount('#app');
