import { defineComponent, provide, ref } from 'vue'
import Child from './Child'

const template = `
  <div>
    <h1>provide</h1>
    <div>
      <span>count: {{ count }}</span>
      <button @click="increment"> + </button>
    </div>
    <Child></Child>
  </div>
`

export default defineComponent({
  name: 'provide',
  template,
  components: {
    Child,
  },
  setup() {
    const count = ref(0)

    function increment() {
      count.value++
    }

    provide('test-1', {
      count,
      increment,
    })

    return {
      count,
      increment
    }
  },
})
