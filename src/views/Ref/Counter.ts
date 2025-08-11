import defineComponent from '../../code/vue3/Component/defineComponent'
import { ref } from '../../code/vue3/ref'

const template = `
  <div>
    <h2>子组件</h2>
    <p>Count: {{ count }}</p>
    <button @click="incrementCount">count++</button>
  </div>
  `
export default defineComponent({
  template,
  setup() {
    const count = ref(0)
    function incrementCount() {
      count.value++
    }

    return {
      count,
      incrementCount,
    }
  },
})
