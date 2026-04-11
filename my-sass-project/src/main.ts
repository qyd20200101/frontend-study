import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from "./router";
import './router/guard';//关键：导入路由守卫
import { createPinia } from 'pinia';


createApp(App).mount('#app')
App.use(createPinia);
App.use(router);
