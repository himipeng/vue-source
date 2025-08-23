import { createApp, defineComponent } from 'vue'
import App from './App'
import './style.css'

const Counter = defineComponent({
  name: 'counter',
  template: `
    <div>
      <span>count: {{ count }}</span>
      <button @click="increment"> + </button>
    </div>
  `,
})

createApp(App).component('Counter', Counter).mount('#app')
