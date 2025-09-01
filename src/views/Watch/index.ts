import { defineComponent, reactive, watch, watchEffect } from 'vue'

const template = `
  <div>
    <h1>Watch</h1>
    <div>person: {{ person }}</div>
    <button @click="onAge">age</button>
    <button @click="onHobby">hobby</button>
  </div>
`

export default defineComponent({
  name: 'Watch',
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

    // 监听整个 person 对象
    watch(
      person,
      (newVal, oldVal) => {
        console.log('[watch] 深度监听整个对象 person:', newVal, oldVal)
      },
      { deep: true } // 监听深层属性
    )

    // 监听单个属性
    watch(
      () => person.age,
      (newVal, oldVal) => {
        console.log(`[watch] 监听单个属性 age: ${oldVal} -> ${newVal}`)
      }
    )

    // 监听数组
    watch(
      () => person.hobby,
      (newVal, oldVal) => {
        console.log('[watch] 监听数组 hobby:', newVal, oldVal)
      },
      { deep: true }
    )

    // 使用 watchEffect 自动依赖追踪
    watchEffect(() => {
      console.log(`[watchEffect] name=${person.name}, age=${person.age}, hobby=${person.hobby.join(', ')}`)
    })

    return {
      person,
      onAge,
      onHobby,
    }
  },
})
