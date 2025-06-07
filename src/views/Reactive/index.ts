import defineComponent from '../../code/Component/defineComponent'
import reactive from '../../code/vue3/reacitve'
import ReactiveEffect from '../../code/vue3/ReactiveEffect'

const template = `
  <h1>Reactive</h1>
  `

export default defineComponent({
  template,
})

const person = reactive({
  name: 'Amy',
  age: 18,
})

// console.log(person.age)

const effect = new ReactiveEffect(() => {
  console.log('effect run:', person.name)
})
effect.run()

person.name = 'Bob'
