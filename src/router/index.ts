import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { ElNotification } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import router from './routers'
import { resolveMenus, type MenuRoute } from './menu'
import store from '@/store'
import Config from '@/settings'
import request from '@/utils/request'
import { getToken } from '@/utils/auth'
import { logOut } from '@/store/modules/user'

NProgress.configure({ showSpinner: false })
let removeRoutes: Array<() => void> = []
function resetRoutes() { removeRoutes.forEach(remove => remove()); removeRoutes = [] }

export async function loadMenus(next: NavigationGuardNext, to: RouteLocationNormalized) {
  try {
    const menus = await request<MenuRoute[]>({ url: 'api/menus/build' })
    const sidebar = resolveMenus(menus)
    const routes = resolveMenus(menus, true)
    resetRoutes()
    removeRoutes = routes.map(route => router.addRoute(route))
    await store.dispatch('GenerateRoutes', routes)
    await store.dispatch('SetSidebarRouters', sidebar)
    await store.dispatch('updateLoadMenus')
    next({ path: to.fullPath, replace: true })
  } catch (error) {
    resetRoutes()
    logOut(store.commit)
    ElNotification.error({ title: '菜单加载失败', message: error instanceof Error ? error.message : '请重新登录' })
    next({ path: '/login', query: { redirect: to.fullPath } })
  }
}

router.beforeEach(async (to, _from, next) => {
  document.title = to.meta.title ? `${String(to.meta.title)} - ${Config.title}` : Config.title
  NProgress.start()
  if (!getToken()) {
    resetRoutes()
    if (to.path === '/login') next()
    else next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }
  if (to.path === '/login') { next('/'); return }
  if (!store.getters.roles.length) {
    try { await store.dispatch('GetInfo') } catch {
      logOut(store.commit)
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }
    await loadMenus(next, to)
  } else if (store.getters.loadMenus) await loadMenus(next, to)
  else next()
})
router.afterEach(() => NProgress.done())
router.onError(() => NProgress.done())
