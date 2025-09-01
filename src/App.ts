import { defineComponent } from 'vue'

const template = `
  <div>
    <div>
      <router-link to="/"></router-link>
      |
      <router-link to="/router"></router-link>
      |
      <router-link to="/ref"></router-link>
      |
      <router-link to="/reactive"></router-link>
    </div>
    <router-view></router-view>
  </div>
`

export default defineComponent({
  name: 'App',
  template,
  components: {},
  setup() {
    return {}
  },
})
