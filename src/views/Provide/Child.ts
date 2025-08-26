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
    <div>
      <span>count2: {{ count2 }}</span>
    </div>
  </div>
`

export default defineComponent({
  name: 'provide/child',
  template,
  setup() {
    const provides = inject<IProvides>('test-1')
    const appProvides = inject('test-2')

    return {
      count: provides?.count || 0,
      increment: provides?.increment || (() => {}),
      count2: appProvides?.count2 || 0,
    }
  },
})
