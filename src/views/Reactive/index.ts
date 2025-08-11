import defineComponent from '../../code/vue3/Component/defineComponent'
import reactive from '../../code/vue3/reacitve'
import { effect } from '../../code/vue3/Component/effect'

const template = `
  <div>
    <h1>Reactive</h1>
    <p>姓名：{{ person.name }}</p>
    <p>年龄：{{ person.age }}</p>
    <p>住址：{{ person.address }}</p>
    <button @click="changeName">修改姓名</button>
    <button @click="changeAge">增加年龄</button>
    <button @click="changAddress">更改住址</button>
  </div>
  `

export default defineComponent({
  template,
  setup() {
    const person = reactive({
      name: 'Amy',
      age: 18,
      address: {
        city: 'Beijing',
        country: 'China',
      },
    })

    function changeName() {
      person.name = 'Sarah'
    }

    function changeAge() {
      person.age++
    }

    function changAddress() {
      person.address.city = 'Shanghai'
    }

    effect(() => {
      console.log(person)
    })

    return {
      person,
      changeName,
      changeAge,
      changAddress,
    }
  },
})
