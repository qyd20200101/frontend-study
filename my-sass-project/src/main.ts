import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from "./router";
import './router/guard';//关键：导入路由守卫
import { createPinia } from 'pinia';
import  "./test";
const app = createApp(App);

// 在实例app上调用插件
app.use(createPinia());
app.use(router);

app.mount('#app');
