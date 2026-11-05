import type { Component } from 'vue'
import type { RouteMeta } from 'vue-router'
import type { AppRoute } from './routers'
import Layout from '@/layout/index.vue'
import ParentView from '@/components/ParentView/index.vue'

export interface MenuRoute {
  path: string
  name?: string
  component?: string
  redirect?: string
  hidden?: boolean
  alwaysShow?: boolean
  meta?: RouteMeta
  children?: MenuRoute[]
}
const views = import.meta.glob<{ default: Component }>('/src/views/**/*.vue')
export function loadView(view: string) {
  const name = view.replace(/^\//, '').replace(/\.vue$/, '')
  const loader = views[`/src/views/${name}.vue`] || views[`/src/views/${name}/index.vue`]
  if (!loader) throw new Error(`菜单组件不存在: ${view}`)
  return loader
}
function flattenChildren(children: MenuRoute[], prefix = ''): MenuRoute[] {
  return children.flatMap(child => {
    const path = prefix ? `${prefix}/${child.path}` : child.path
    return child.component === 'ParentView' && child.children?.length
      ? flattenChildren(child.children, path)
      : [{ ...child, path }]
  })
}
/** Keep sidebar hierarchy, but flatten ParentView containers for route registration. */
export function resolveMenus(menus: MenuRoute[], flatten = false): AppRoute[] {
  return menus.map(menu => {
    const children = menu.children?.length ? resolveMenus(flatten ? flattenChildren(menu.children) : menu.children, flatten) : undefined
    const component = menu.component === 'Layout' ? Layout : menu.component === 'ParentView' ? ParentView : menu.component ? loadView(menu.component) : undefined
    // Backend menu records combine route and sidebar fields; adapt at this boundary.
    return { ...menu, component, children, redirect: children ? menu.redirect : undefined } as AppRoute
  })
}
