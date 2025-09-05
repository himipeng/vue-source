import { defineComponent, inject } from 'vue'
import { InjectKeyCounter, type ProvideCounter } from '.'

const template = `
  <div>
    <p>Child</p>
    <div>
      <span>count: {{ count }}</span>
      <button @click="increment"> + </button>
    </div>
    <div>
      <span>version: {{ version }}</span>
    </div>
  </div>
`

export default defineComponent({
  name: 'Provide/Child',
  template,
  setup() {
    // 来自 父组件
    const provides = inject<ProvideCounter>(InjectKeyCounter)
    // 来自 app
    const appProvides = inject('globalState')

    return {
      count: provides?.count || 0,
      increment: provides?.increment || (() => {}),
      version: appProvides?.version || '',
    }
  },
})
