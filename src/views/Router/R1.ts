import { defineComponent } from 'vue'

const template = `
  <div>
    <p>R1</p>
    <router-view></router-view>
  </div>
`

export default defineComponent({
  name: 'r1',
  template,
})
