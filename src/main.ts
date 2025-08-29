import './style.css'
import { createApp } from 'vue'
import App from './App'
import router from './router'
import Counter from './components/Counter'

const app = createApp(App)

// 插件
app.use(router)

// 全局组件
app.component('Counter', Counter)

// 挂载
app.mount('#app')
