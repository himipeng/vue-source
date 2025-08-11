import defineComponent from '@/code/vue3/Component/defineComponent'
import reactive from '@/code/vue3/reacitve'
import { ref } from '@/code/vue3/ref'
import watch from '@/code/vue3/watch/watch'
import watchEffect from '@/code/vue3/watch/watchEffect'

const template = `
  <div>
    <h1>Watch</h1>
    <div>
      <span>count: {{ count }}</span>
      <button @click="incrementCount">count++</button>
    </div>
    <div>
      <div>person: {{ person }}</div>
      <button @click="changePerson">changePerson</button>
    </div>
  </div>
  `

export default defineComponent({
  template,
  setup() {
    const count = ref(0)
    function incrementCount() {
      count.value++
    }

    // ref
    watch(count, (newValue) => {
      console.log(`[watch] ref: ${newValue}`)
    })

    watchEffect(() => {
      console.log(`[watchEffect]: ${count.value}`)
    })

    const person = reactive({
      name: 'himi',
      age: 18,
      address: {
        city: 'Beijing',
      },
    })

    function changePerson() {
      person.address.city += '1'
    }

    // Getter
    watch(
      () => person.address.city,
      (newValue) => {
        console.log(`[watch] Getter: ${JSON.stringify(newValue)}`)
      }
    )

    // reactive
    watch(
      person,
      (newValue) => {
        console.log(`[watch] reactive: ${JSON.stringify(newValue)}`)
      },
      {
        deep: true,
      }
    )

    // Array
    watch([person.address, count], (newValue) => {
      console.log('[watch] Array:', newValue)
    })

    return {
      count,
      incrementCount,
      person,
      changePerson,
    }
  },
})
