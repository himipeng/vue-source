import defineComponent from '../../code/vue2/Component/defineComponent'
// import ReactiveEffect from '../../code/vue3/ReactiveEffect'
// import { ref } from '../../code/vue3/ref'

const template = `
  <div>
    <h1>Ref</h1>
    <p>Count: {{ count }}</p>
    <button @click="incrementCount">count++</button>
    <button @click="log">log</button>
  </div>
  `
export default defineComponent({
  template,
  // setup() {
  //   const count = ref(0)
  //   function incrementCount() {
  //     count.value++
  //     console.log(this)
  //   }

  //   return {
  //     count,
  //     incrementCount,
  //   }
  // },
  // methods: {
  //   log() {
  //     console.log(this)
  //   },
  // },
})

// const count = ref(0)
// const effect = new ReactiveEffect(() => {
//   console.log('Count changed:', count.value)
// })
// effect.run()
// count.value = 1
