import { defineComponent, inject } from 'vue'

interface IProvides {
  count: number
  increment: () => void
}

const template = `
  <div>
    <p>child</p>
    <div>
      <span>count: {{ count }}</span>
      <button @click="increment"> + </button>
    </div>
  </div>
`

export default defineComponent({
  name: 'provide/child',
  template,
  setup() {
    const provides = inject<IProvides>('test-1')

    return {
      count: provides?.count || 0,
      increment: provides?.increment || (() => {}),
    }
  },
})
