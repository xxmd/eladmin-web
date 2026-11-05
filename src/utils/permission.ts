import type { App } from 'vue'
import store from '@/store'

export function checkPer(required: readonly string[] | undefined): boolean {
  if (!required?.length) return false
  const roles: string[] = store.getters.roles
  return roles.some(role => required.includes(role))
}
export default { install(app: App) { app.config.globalProperties.checkPer = checkPer } }
