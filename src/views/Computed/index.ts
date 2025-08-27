import { computed, defineComponent, ref } from 'vue'

const template = `
  <div>
    <h1>computed</h1>
    <div>
      <span>count: {{ count }}</span>
      <button @click="increment"> + </button>
    </div>
    <div>
      <span>double: {{ double }}</span>
      <button @click="doubleIncrement"> + </button>
    </div>
  </div>
`

export default defineComponent({
  name: 'computed',
  template,
  setup() {
    const count = ref(0)
    const double = computed({
      get: () => count.value * 2,
      set: (value) => {
        count.value = value / 2
      },
    })

    function increment() {
      count.value++
    }

    function doubleIncrement() {
      double.value++
    }

    return {
      count,
      double,
      increment,
      doubleIncrement,
    }
  },
})
