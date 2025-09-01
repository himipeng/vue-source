import { defineComponent } from 'vue'
import Counter from './Counter'

const template = `
  <div>
    <h1>Component</h1>
    <div>
      <p>全局组件</p>
      <Counter></Counter>
    </div>
    <div>
      <p>局部组件</p>
      <Counter2></Counter2>
      <Counter2></Counter2>
    </div>
  </div>
`

export default defineComponent({
  name: 'Component',
  template,
  components: {
    Counter2: Counter,
  },
})
