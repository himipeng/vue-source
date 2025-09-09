<template>
  <div>
    <div>
      <router-link to="/"></router-link>
      |
      <router-link to="/router"></router-link>
      |
      <router-link to="/component"></router-link>
      |
      <router-link to="/ref"></router-link>
      |
      <router-link to="/computed"></router-link>
      |
      <router-link to="/reactive"></router-link>
      |
      <router-link to="/watch"></router-link>
      |
      <router-link to="/provide"></router-link>
      |
      <router-link to="/sfc"></router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

interface Props {}

export default defineComponent({
  name: 'App',
  components: {},
  setup() {
    return {}
  },
})
</script>
