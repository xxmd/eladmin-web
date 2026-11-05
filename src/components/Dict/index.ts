import { type App } from 'vue'
import Dict, { type DictState } from './Dict'
declare module 'vue' {
  interface ComponentCustomOptions { dicts?: string[] }
  interface ComponentCustomProperties { dict: DictState }
}

const install = function(Vue: App) {
  Vue.mixin({
    data() {
      if (this.$options.dicts instanceof Array) {
        const dict = {
          dict: {},
          label: {}
        }
        return {
          dict
        }
      }
      return {}
    },
    created() {
      if (this.$options.dicts instanceof Array) {
        new Dict(this.dict).init(this.$options.dicts, () => {
          this.$nextTick(() => {
            this.$emit('dictReady')
          })
        })
      }
    }
  })
}

export default { install }
