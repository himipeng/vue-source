import defineComponent from '../../code/defineComponent'

const template = `
  <div>
    <h1>About</h1> 
    <a href="#/about/c1">C1</a>
    <a href="#/about/c2">C2</a>
    <router-view></router-view>
  </div>
  `

export default defineComponent({
  template,
})
