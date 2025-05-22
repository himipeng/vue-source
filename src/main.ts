import Nav from './components/nav'
import router from './router'
import './style.css'

const app = document.querySelector('#app')
if (!app) {
  throw new Error('can not find app')
}

app.innerHTML = `<div id="main">
    <div id="nav"></div>
    <router-view></router-view>
  </div>`

router.mount(app)

new Nav(router).mount(document.querySelector('#nav') as HTMLDivElement)
