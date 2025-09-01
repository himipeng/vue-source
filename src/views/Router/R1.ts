import { defineComponent } from 'vue'

const template = `
  <div>
    <p>R1</p>
    <div>
      <router-link to="/router/r1/r3"></router-link>
      |
      <router-link to="/router/r1/r4"></router-link>
    </div>
    <router-view></router-view>
  </div>
`

export default defineComponent({
  name: 'R1',
  template,
})
