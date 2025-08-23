import { defineComponent, ref } from 'vue'

// const template = `
//     <div> hello {{ name }} <p> hi </p> </div>
// `

// const template = `
//   <div disabled id="myApp" :class="cls" >
//     <h1>Component</h1>
//     <div> + {{ name }} <span> - </span> </div>
//     <button @click="increment">+</button>
//     <C1></C1>
//     <C2></C2>
//     <C1></C1>
//   </div>
//   `

const B = defineComponent({
  name: 'B',
  template: `
    <Counter :count="count" :increment="increment"></Counter>
  `,
  setup() {
    const count = ref(5)
    return {
      count: count,
      increment: () => {
        count.value++
        console.log('increment', count.value)
      },
    }
  },
})

const A = defineComponent({
  name: 'A',
  template: `
    <B></B>
  `,
  components: {
    B,
  },
})

const template = `
  <A></A>
`

export default defineComponent({
  name: 'app',
  template,
  components: {
    A,
  },
})
