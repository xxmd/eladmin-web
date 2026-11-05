import { createStore } from 'vuex'
import getters from './getters'
const files = import.meta.glob('./modules/*.{js,ts}', { eager: true, import: 'default' })
const modules = Object.fromEntries(Object.entries(files).map(([path, value]) => [path.split('/').pop().replace(/\.(js|ts)$/, ''), value]))
export default createStore({ modules, getters })
