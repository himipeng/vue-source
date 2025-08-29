import { defineComponent } from 'vue'

const template = `
  <div>
    <h1>Router</h1>
    <div>
      <router-link to="/router/r1"></router-link>
      |
      <router-link to="/router/r2"></router-link>
    </div>
    <router-view></router-view>
  </div>
`

export default defineComponent({
  name: 'router',
  template,
  setup() {
    return {}
  },
})
