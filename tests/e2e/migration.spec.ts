import { test, expect, type Page } from '@playwright/test'
import type { Job } from '../../src/types/api'

const user = { id: 1, username: 'admin', nickName: '管理员', email: 'test@example.com', phone: '13800000000', dept: { id: 1, name: '研发部' }, roles: [{ id: 1, name: '超级管理员', level: 1 }], jobs: [], enabled: true }
const jobs = [{ id: 1, name: '工程师', jobSort: 1, enabled: true, createTime: '2026-11-04 10:00:00' }]
const extraViews = ['system/dict/index', 'system/timing/index', 'monitor/online/index', 'monitor/log/index', 'monitor/log/errorLog', 'monitor/server/index', 'maint/server/index', 'maint/app/index', 'maint/database/index', 'maint/deploy/index', 'maint/deployHistory/index', 'tools/storage/index', 'tools/email/index', 'tools/aliPay/index', 'generator/index', 'components/Editor', 'components/MarkDown', 'components/YamlEdit', 'components/Echarts', 'components/icons/index']
const menus = [{ path: '/system', component: 'Layout', name: 'System', meta: { title: '系统管理' }, children: [
  { path: 'job', component: 'system/job/index', name: 'Job', meta: { title: '岗位管理' } },
  { path: 'user', component: 'system/user/index', name: 'User', meta: { title: '用户管理' } },
  { path: 'dept', component: 'system/dept/index', name: 'Dept', meta: { title: '部门管理' } },
  { path: 'role', component: 'system/role/index', name: 'Role', meta: { title: '角色管理' } },
  { path: 'menu', component: 'system/menu/index', name: 'Menu', meta: { title: '菜单管理' } }
] }, { path: '/smoke', component: 'Layout', children: extraViews.map((component, index) => ({ path: String(index), component, name: `Smoke${index}`, meta: { title: component } })) }]

async function mockApi(page: Page, roles = ['admin'], invalidMenu = false) {
  let records: Job[] = jobs.map(job => ({ ...job }))
  await page.route(/\/(auth|api)\//, async route => {
    const request = route.request()
    const url = new URL(request.url())
    if (!/^\/(auth|api)\//.test(url.pathname)) return route.continue()
    let result: unknown = { content: [], totalElements: 0 }
    if (url.pathname === '/auth/code') result = { uuid: 'test-code', img: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="38"><text x="5" y="25">1234</text></svg>' }
    else if (url.pathname === '/auth/login') result = { token: 'test-token', user: { user, roles } }
    else if (url.pathname === '/auth/info') result = { user, roles }
    else if (url.pathname === '/api/menus/build') result = invalidMenu ? [{ path: '/broken', component: 'missing-component' }] : menus
    else if (url.pathname === '/api/job') {
      const body = request.postDataJSON() as Job | number[] | null
      if (request.method() === 'POST' && body && !Array.isArray(body)) records.push({ ...body, id: 2 })
      if (request.method() === 'PUT' && body && !Array.isArray(body)) records = records.map(job => job.id === body.id ? { ...job, ...body } : job)
      if (request.method() === 'DELETE' && Array.isArray(body)) records = records.filter(job => !body.includes(Number(job.id)))
      const filtered = records.filter(job => job.name.includes(url.searchParams.get('name') || ''))
      result = request.method() === 'GET' ? { content: filtered, totalElements: filtered.length } : {}
    }
    else if (url.pathname === '/api/dictDetail') result = { content: [{ id: 1, label: '启用', value: 'true' }, { id: 2, label: '停用', value: 'false' }], totalElements: 2 }
    else if (url.pathname === '/api/users') result = { content: [user], totalElements: 1 }
    else if (url.pathname === '/api/dept') result = { content: [{ id: 1, name: '研发部', label: '研发部', enabled: true, leaf: true, hasChildren: false }], totalElements: 1 }
    else if (url.pathname === '/api/roles/all') result = [{ id: 1, name: '超级管理员', level: 1 }]
    else if (url.pathname === '/api/roles/level') result = { level: 1 }
    else if (url.pathname === '/api/roles') result = { content: [{ id: 1, name: '超级管理员', level: 1, dataScope: '全部', menus: [] }], totalElements: 1 }
    else if (url.pathname === '/api/monitor') result = { sys: { os: 'Test', ip: '127.0.0.1', day: '1天' }, cpu: { used: '10', coreNumber: 4 }, memory: { total: '8GB', used: '1GB', available: '7GB', usageRate: '12' }, swap: { total: '0', used: '0', available: '0', usageRate: '0' }, disk: { total: '100GB', used: '10GB', available: '90GB', usageRate: '10' }, time: '12:00' }
    else if (url.pathname === '/api/menus/lazy') result = []
    else if (url.pathname === '/api/visits/chartData') result = { visitsData: [], ipData: [] }
    else if (url.pathname.startsWith('/api/visits')) result = { newVisits: 0, newIp: 0, recentVisits: 0, recentIp: 0 }
    if (request.method() === 'OPTIONS') { await route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' } }); return }
    await route.fulfill({ json: result, headers: { 'access-control-allow-origin': '*' } })
  })
}

test('login, dynamic routes, CRUD dialog and legacy pages render on Vue 3', async ({ page, context }) => {
  const errors: string[] = []
  page.on('pageerror', error => { errors.push(error.message); console.error(error.stack) })
  page.on('console', message => { if (message.type() === 'error' && !message.text().includes('Failed to load resource')) errors.push(message.text()) })
  await mockApi(page)
  await page.goto('/system/job')
  await expect(page.getByPlaceholder('账号')).toBeVisible()
  await page.screenshot({ path: 'test-results/login.png' })
  await page.getByPlaceholder('验证码').fill('1234')
  await page.getByRole('button', { name: '登 录' }).click()
  await expect(page).toHaveURL(/\/system\/job$/)
  await expect(page.getByText('工程师', { exact: true })).toBeVisible()
  await page.screenshot({ path: 'test-results/job.png' })
  await page.getByRole('button', { name: '新增', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('dialog').getByRole('textbox').fill('测试岗位')
  await page.getByRole('dialog').getByRole('button', { name: '确认', exact: true }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  const createdRow = page.getByRole('row').filter({ hasText: '测试岗位' })
  await expect(createdRow).toBeVisible()
  await createdRow.getByRole('button', { name: '编辑岗位' }).click()
  await page.getByRole('dialog').getByRole('textbox').fill('更新岗位')
  await page.getByRole('dialog').getByRole('button', { name: '确认', exact: true }).click()
  const updatedRow = page.getByRole('row').filter({ hasText: '更新岗位' })
  await expect(updatedRow).toBeVisible()
  await updatedRow.getByRole('button', { name: '删除岗位' }).click()
  await page.getByRole('button', { name: '确定', exact: true }).click()
  await expect(updatedRow).not.toBeVisible()
  const queryRequest = page.waitForRequest(request => request.url().includes('/api/job?') && request.url().includes('name='))
  await page.getByPlaceholder('输入岗位名称搜索').fill('工程师')
  await page.getByPlaceholder('输入岗位名称搜索').press('Enter')
  const queryUrl = new URL((await queryRequest).url())
  expect(queryUrl.searchParams.getAll('sort')).toEqual(['jobSort,asc', 'id,desc'])
  for (const path of ['/system/user', '/system/dept', '/system/role', '/system/menu', '/dashboard', '/user/center']) {
    await page.goto(path)
    await expect(page.locator('.app-main')).toBeVisible()
    await page.waitForTimeout(250)
  }
  expect(errors).toEqual([])
  expect((await context.cookies()).some(cookie => cookie.name === 'ELADMIN-TOEKN')).toBeTruthy()
})


test('all migrated feature pages load without runtime errors', async ({ page, context }) => {
  test.setTimeout(90000)
  const errors: string[] = []
  page.on('pageerror', error => { errors.push(`${page.url()}: ${error.message}`) })
  await mockApi(page)
  await context.addCookies([{ name: 'ELADMIN-TOEKN', value: 'test-token', domain: '127.0.0.1', path: '/' }])
  for (const [index, view] of extraViews.entries()) {
    await page.goto(`/smoke/${index}`)
    await expect(page.locator('.app-main'), view).toBeVisible()
    await expect(page.locator('.app-main > :first-child'), view).toBeVisible()
    await page.waitForTimeout(300)
  }
  expect(errors).toEqual([])
})


test('read-only permissions hide write controls', async ({ page, context }) => {
  await mockApi(page, ['job:list'])
  await context.addCookies([{ name: 'ELADMIN-TOEKN', value: 'test-token', domain: '127.0.0.1', path: '/' }])
  await page.goto('/system/job')
  await expect(page.getByText('工程师', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '新增', exact: true })).toHaveCount(0)
  await expect(page.getByRole('button', { name: '编辑岗位' })).toHaveCount(0)
  await expect(page.getByRole('switch')).toBeDisabled()
})

test('invalid dynamic menu returns to login without hanging navigation', async ({ page, context }) => {
  await mockApi(page, ['admin'], true)
  await context.addCookies([{ name: 'ELADMIN-TOEKN', value: 'test-token', domain: '127.0.0.1', path: '/' }])
  await page.goto('/system/job')
  await expect(page.getByPlaceholder('账号')).toBeVisible()
  await expect(page.getByText('菜单加载失败', { exact: true })).toBeVisible()
  expect((await context.cookies()).some(cookie => cookie.name === 'ELADMIN-TOEKN')).toBe(false)
})


test('legacy CRUD forms, tree selector and column visibility remain functional', async ({ page, context }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await mockApi(page)
  await context.addCookies([{ name: 'ELADMIN-TOEKN', value: 'test-token', domain: '127.0.0.1', path: '/' }])
  await page.goto('/system/user')
  await expect(page.getByRole('columnheader', { name: '用户名', exact: true })).toBeVisible()
  await page.locator('.crud-opts-right button').last().click()
  await page.locator('.el-popover:visible').getByText('用户名', { exact: true }).click()
  await expect(page.getByRole('columnheader', { name: '用户名', exact: true })).toHaveCount(0)
  await page.locator('.el-popover:visible').getByText('用户名', { exact: true }).click()
  await expect(page.getByRole('columnheader', { name: '用户名', exact: true })).toBeVisible()
  await page.locator('.crud-opts-right button').last().click()
  for (const path of ['/system/user', '/system/dept', '/system/role', '/system/menu']) {
    await page.goto(path)
    await page.getByRole('button', { name: '新增', exact: true }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('dialog').getByRole('button', { name: '取消', exact: true }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  }
  expect(errors).toEqual([])
})
