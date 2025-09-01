import { defineComponent, reactive } from 'vue'

const template = `
  <div>
    <h1>Reactive</h1>
    <div>person: {{ person }}</div>
    <button @click="onAge">age</button>
    <button @click="onHobby">hobby</button>
  </div>
`

export default defineComponent({
  name: 'Reactive',
  template,
  setup() {
    const person = reactive({
      name: 'Amy',
      age: 18,
      hobby: ['book', 'ball'],
    })

    // 修改数据
    function onAge() {
      person.age++
    }

    // 数组方法
    function onHobby() {
      person.hobby.push('1')
    }

    return {
      person,
      onAge,
      onHobby,
    }
  },
})
