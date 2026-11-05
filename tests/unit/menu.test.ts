import { describe, expect, it, vi } from 'vitest'
vi.mock('@/layout/index.vue', () => ({ default: { name: 'Layout' } }))
vi.mock('@/components/ParentView/index.vue', () => ({ default: { name: 'ParentView' } }))
import { loadView, resolveMenus, type MenuRoute } from '@/router/menu'

describe('backend menu resolution', () => {
  const menus: MenuRoute[] = [{ path: '/system', component: 'Layout', children: [{ path: 'nested', component: 'ParentView', children: [{ path: 'job', name: 'Job', component: 'system/job/index' }] }] }]
  it('keeps sidebar hierarchy without mutating the backend response', () => {
    const snapshot = JSON.stringify(menus)
    const sidebar = resolveMenus(menus)
    expect(sidebar[0].children?.[0].path).toBe('nested')
    expect(sidebar[0].children?.[0].children?.[0].path).toBe('job')
    expect(JSON.stringify(menus)).toBe(snapshot)
  })
  it('flattens ParentView routes while retaining the full path', () => {
    const routes = resolveMenus(menus, true)
    expect(routes[0].children?.[0].path).toBe('nested/job')
    expect(routes[0].children?.[0].name).toBe('Job')
    expect(typeof routes[0].children?.[0].component).toBe('function')
  })
  it('resolves directory views and fails clearly for missing components', () => {
    expect(loadView('system/job')).toBe(loadView('/system/job/index.vue'))
    expect(() => loadView('missing')).toThrow('菜单组件不存在: missing')
  })
})
