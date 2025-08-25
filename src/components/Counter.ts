import { defineComponent } from 'vue'

export default defineComponent({
  name: 'counter',
  template: `
    <div>
      <span>count: {{ count }}</span>
      <button @click="increment"> + </button>
    </div>
  `,
  props: ['count', 'increment'],
})
