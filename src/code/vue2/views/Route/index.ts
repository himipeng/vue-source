import defineComponent from "@vue/vue2/Component/defineComponent"

const template = `
  <div>
    <h1>Route</h1> 
    <a href="#/route/c1">C1</a>
    <a href="#/route/c2">C2</a>
    <router-view></router-view>
  </div>
  `

export default defineComponent({
  template,
})
