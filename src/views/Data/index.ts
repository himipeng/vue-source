import defineComponent from '../../code/vue2/Component/defineComponent'
import Counter from './Counter'

const template = `
  <div>
    <h1>Data</h1>
    <p>Count: {{ count }}</p>
    <p>Count: {{ count }}</p>
    <button @click="incrementCount">count++</button>
    <p>Person: {{ person.name }}, Age: {{ person.age }}</p>
    <button @click="incrementAge">Age++</button>
    <button @click="changePerson">change person</button>
    <hr/>
    <span>子组件1</span>
    <Counter></Counter>
    <hr/>
    <span>子组件2</span>
    <Counter></Counter>
  </div>
  `

const vc = defineComponent({
  name: 'DataView',
  template,
  data() {
    return {
      count: 0,
      person: {
        age: 1,
        name: 'amy',
      },
    }
  },
  methods: {
    incrementCount() {
      this.count += 1
    },
    incrementAge() {
      this.person.age += 1
    },
    changePerson() {
      this.person = {
        age: 18,
        name: 'bob',
      }
    },
  },
  components: {
    Counter,
  },
})

export default vc
