import defineComponent from '../../code/defineComponent'

const template = `
  <div>
    <h1>Data</h1>
    <p>Count: {{ count }}</p>
    <p>Person: {{ person.name }}, Age: {{ person.age }}</p>
    <button @click="incrementCount">count++</button>
    <button @click="incrementAge">Age++</button>
    <button @click="changePerson">change person</button>
  </div>
  `

const vc = defineComponent({
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
})

console.log(vc)

export default vc
