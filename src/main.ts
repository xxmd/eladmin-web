import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as icons from '@element-plus/icons-vue'
import 'normalize.css/normalize.css'
import 'element-plus/dist/index.css'
import './assets/styles/element-variables.scss'
import './assets/styles/index.scss'

import App from './App.vue'
import store from './store'
import router from './router/routers'
import dict from './components/Dict'
import checkPer from './utils/permission'
import permission from './components/Permission'
import SvgIcon from './components/SvgIcon/index.vue'
import LegacyEditIcon from './components/LegacyEditIcon/index.vue'
import './assets/icons'
import './router'

const app = createApp(App)
app.use(store)
app.use(router)
app.use(ElementPlus, { locale: zhCn })
app.use(checkPer)
app.use(permission)
app.use(dict)
app.component('SvgIcon', SvgIcon)
for (const [name, component] of Object.entries(icons)) app.component(`Icon${name}`, name === 'Edit' ? LegacyEditIcon : component)
app.mount('#app')
