import defineComponent from '../../code/Component/defineComponent'
import ReactiveEffect from '../../code/vue3/ReactiveEffect'
import { ref } from '../../code/vue3/ref'

const template = `
  <h1>Ref</h1>
  `

export default defineComponent({
  template,
})

// const flag = ref(true)
// const count = ref(0)

// const effect = new ReactiveEffect(() => {
//   console.log(flag.value ? count.value : 'no count')
// })

// effect.run()
// flag.value = false
// count.value++

const person = ref({
  name: 'Amy',
  age: 18,
})
const effect = new ReactiveEffect(() => {
  console.log('effect run:', person.value.name, person.value.age)
})
effect.run()
person.value.name = 'Bob'
person.value.age = 20
