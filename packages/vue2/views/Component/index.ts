import defineComponent from '../../Component/defineComponent'
import C1 from './C1'
import C2 from './C2'

const template = `
  <div>
    <h1>Component</h1>
    <C1></C1>
    <C2></C2>
    <C1></C1>
  </div>
  `

export default defineComponent({
  template,
  components: {
    C1,
    C2,
  },
})
