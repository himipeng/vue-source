import defineComponent from '../../code/Component/defineComponent'
import { ref } from '../../code/vue3/ref'

const template = `
  <h1>Ref</h1>
  `

export default defineComponent({
  template,
})

const count = ref(0)

console.log(count)
