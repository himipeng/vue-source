import defineComponent from '../../code/Component/defineComponent'

const template = `
  <div>
    <p>Count: {{ count }}</p>
    <button @click="incrementCount">count++</button>
  </div>
  `

export default defineComponent({
  name: 'Counter',
  template,
  data() {
    return {
      count: 0,
    }
  },
  methods: {
    incrementCount() {
      this.count += 1
    },
  },
})
