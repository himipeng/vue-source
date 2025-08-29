import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'counter',
  template: `
    <div>
      <span>count: {{ count }}</span>
      <button @click="increment"> + </button>
    </div>
  `,
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
