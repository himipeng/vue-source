import { defineComponent, ref } from 'vue'

const template = `
  <div>
    <h1>Ref</h1>
    <span>count: {{ count }}</span>
    <button @click="increment">+</button>
  </div>
`

export default defineComponent({
  name: 'Ref',
  template,
  setup() {
    const count = ref(0)

    function increment() {
      count.value++
    }

    return {
      count,
      increment,
    }
  },
})
