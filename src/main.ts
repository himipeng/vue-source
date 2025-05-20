import router from './router'
import './style.css'

document.querySelector('#app')!.innerHTML = `<div id="main">
    <div id="nav"></div>
    <div id="view"></div>
  </div>`

router.mount(document.querySelector('#view') as HTMLDivElement)
