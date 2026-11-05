import type { Store } from 'vuex'
import type { RootState } from '@/store'
import type { ElMessage, ElNotification, ElMessageBox } from 'element-plus'
declare module 'vue' {
  interface ComponentCustomProperties {
    checkPer(permissions: string[]): boolean
    $store: Store<RootState>
    $message: typeof ElMessage
    $notify: typeof ElNotification
    $confirm: typeof ElMessageBox.confirm
    $prompt: typeof ElMessageBox.prompt
    $alert: typeof ElMessageBox.alert
  }
}
export {}

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    affix?: boolean
    noCache?: boolean
    breadcrumb?: boolean
  }
}
