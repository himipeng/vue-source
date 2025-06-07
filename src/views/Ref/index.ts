import defineComponent from '../../code/Component/defineComponent'
import ReactiveEffect from '../../code/vue3/reactiveEffect'
import { ref } from '../../code/vue3/ref'
import './test'

const template = `
  <h1>Ref</h1>
  `

export default defineComponent({
  template,
})

const flag = ref(true)
const count = ref(0)

const effect = new ReactiveEffect(() => {
  console.log(flag.value ? count.value : 'no count')
})

effect.run()
flag.value = false
count.value++
