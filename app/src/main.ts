import './style.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Counter from './components/Counter'

const app = createApp(App)

// 全局注入
app.provide('globalState', { version: '1.0.0' })

// 插件
app.use(router)

// 全局组件
app.component('Counter', Counter)

// 挂载
app.mount('#app')
