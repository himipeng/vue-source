import defineComponent from '../../code/defineComponent'

const template = `
  <h1>data</h1>
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
})

console.log(vc)

export default vc
