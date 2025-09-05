import { defineComponent, provide, Ref, ref } from 'vue'
import Child from './Child'

export const InjectKeyCounter = Symbol('counter')

export interface ProvideCounter {
  count: Ref<number>
  increment: () => void
}

const template = `
  <div>
    <h1>Provide</h1>
    <div>
      <span>count: {{ count }}</span>
      <button @click="increment"> + </button>
    </div>
    <hr></hr>
    <Child></Child>
  </div>
`

export default defineComponent({
  name: 'Provide',
  template,
  components: {
    Child,
  },
  setup() {
    const count = ref(0)

    function increment() {
      count.value++
    }

    provide<ProvideCounter>(InjectKeyCounter, {
      count,
      increment,
    })

    return {
      count,
      increment,
    }
  },
})
