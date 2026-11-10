import { test, expect, type Page } from '@playwright/test'
import type { Job } from '../../src/types/api'

const user = { id: 1, username: 'admin', nickName: '管理员', email: 'test@example.com', phone: '13800000000', dept: { id: 1, name: '研发部' }, roles: [{ id: 1, name: '超级管理员', level: 1 }], jobs: [], enabled: true }
const jobs = [{ id: 1, name: '工程师', jobSort: 1, enabled: true, createTime: '2026-11-04 10:00:00' }]
const extraViews = ['system/dict/index', 'system/timing/index', 'monitor/online/index', 'monitor/log/index', 'monitor/log/errorLog', 'monitor/server/index', 'maint/server/index', 'maint/app/index', 'maint/database/index', 'maint/deploy/index', 'maint/deployHistory/index', 'tools/storage/index', 'tools/email/index', 'tools/aliPay/index', 'generator/index', 'generator/config', 'generator/preview', 'components/Editor', 'components/MarkDown', 'components/YamlEdit', 'components/Echarts', 'components/icons/index']
const menus = [{ path: '/system', component: 'Layout', name: 'System', meta: { title: '系统管理' }, children: [
  { path: 'job', component: 'system/job/index', name: 'Job', meta: { title: '岗位管理' } },
  { path: 'user', component: 'system/user/index', name: 'User', meta: { title: '用户管理' } },
  { path: 'dept', component: 'system/dept/index', name: 'Dept', meta: { title: '部门管理' } },
  { path: 'role', component: 'system/role/index', name: 'Role', meta: { title: '角色管理' } },
  { path: 'menu', component: 'system/menu/index', name: 'Menu', meta: { title: '菜单管理' } }
] }, { path: '/smoke', component: 'Layout', children: extraViews.map((component, index) => ({ path: component === 'generator/config' || component === 'generator/preview' ? `${index}/:tableName` : String(index), component, name: `Smoke${index}`, meta: { title: component } })) }]

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
    else if (url.pathname === '/api/dict/all') result = [{ id: 1, name: 'user_status', description: '用户状态' }]
    else if (url.pathname === '/api/dict') result = { content: [{ id: 1, name: 'user_status', description: '用户状态' }], totalElements: 1 }
    else if (url.pathname === '/api/genConfig/sys_user') result = { id: 1, tableName: 'sys_user', author: 'test', pack: 'me.test', path: '/tmp', moduleName: 'system', cover: false, apiPath: '/tmp', prefix: '', apiAlias: '用户' }
    else if (url.pathname === '/api/generator/sys_user/1') result = [{ name: 'Entity', content: 'public class User {}' }]
    else if (url.pathname === '/api/menus/lazy') result = []
    else if (url.pathname === '/api/visits/chartData') result = { visitsData: [], ipData: [] }
    else if (url.pathname.startsWith('/api/visits')) result = { newVisits: 0, newIp: 0, recentVisits: 0, recentIp: 0 }
    if (request.method() === 'OPTIONS') { await route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' } }); return }
    await route.fulfill({ json: result, headers: { 'access-control-allow-origin': '*' } })
  })
}

test('classic edit controls, menu values and department labels match the legacy UI', async ({ page, context }) => {
  await mockApi(page)
  const menu = { id: 10, title: '测试目录', type: 0, iFrame: false, hidden: false, cache: false, path: 'folder', menuSort: 1, pid: null }
  const childMenu = { ...menu, id: 11, title: '测试菜单', type: 1, hidden: true, cache: true, path: 'inside' }
  const parent = { id: 1, name: '研发部', label: '研发部', leaf: true }
  const dept = { id: 2, name: '测试部门', enabled: true, deptSort: 6, pid: 1, hasChildren: false }
  await page.route(/\/api\/(?:menus|dept)(?:\/superior)?(?:\?|$)/, async route => {
    const { pathname } = new URL(route.request().url())
    const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET, POST, PUT' }
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
    const fixtures: Record<string, unknown> = {
      '/api/menus': { content: [menu, childMenu], totalElements: 2 },
      '/api/menus/superior': [],
      '/api/dept': { content: [dept], totalElements: 1 },
      '/api/dept/superior': { content: [parent], totalElements: 1 }
    }
    await route.fulfill({ json: fixtures[pathname], headers })
  })
  await context.addCookies([{ name: 'ELADMIN-TOEKN', value: 'test-token', domain: '127.0.0.1', path: '/' }])
  for (const view of ['user', 'role', 'job', 'menu', 'dept']) {
    await page.goto(`/system/${view}`)
    const edit = page.locator('.el-table .classic-edit-button').first()
    await expect(edit.locator('svg path')).toHaveAttribute('d', /^M199 223/)
    await expect(edit).toHaveCSS('height', '28px')
  }

  const dialog = page.getByRole('dialog')
  const item = (label: string) => dialog.locator('.el-form-item').filter({ hasText: label })
  await page.locator('.el-table .classic-edit-button').first().click()
  for (const label of ['部门名称', '状态', '上级部门']) {
    await expect(item(label).locator('.el-form-item__label')).toHaveCSS('font-weight', '700')
  }
  await expect(item('状态').getByRole('radio', { name: '启用' })).toBeChecked()
  await expect(item('上级部门').getByText('研发部', { exact: true })).toBeVisible()

  await page.goto('/system/menu')
  await page.getByRole('row').filter({ hasText: '测试目录' }).locator('.classic-edit-button').click()
  await expect(dialog.getByRole('radio', { name: '目录', exact: true })).toBeChecked()
  await expect(item('外链菜单').getByRole('radio', { name: '否', exact: true })).toBeChecked()
  await expect(item('菜单可见').getByRole('radio', { name: '是', exact: true })).toBeChecked()
  const routeTop = await item('路由地址').evaluate(element => (element as HTMLElement).offsetTop)
  const sortTop = await item('菜单排序').evaluate(element => (element as HTMLElement).offsetTop)
  expect(routeTop).toBe(sortTop)
  await dialog.getByRole('button', { name: '取消', exact: true }).click()

  await page.getByRole('row').filter({ hasText: '测试菜单' }).locator('.classic-edit-button').click()
  await expect(dialog.getByRole('radio', { name: '菜单', exact: true })).toBeChecked()
  await expect(item('菜单缓存').getByRole('radio', { name: '是', exact: true })).toBeChecked()
  await expect(item('菜单可见').getByRole('radio', { name: '否', exact: true })).toBeChecked()
  await item('菜单可见').getByText('是', { exact: true }).click()
  const update = page.waitForRequest(request => request.url().endsWith('/api/menus') && request.method() === 'PUT')
  await dialog.getByRole('button', { name: '确认', exact: true }).click()
  expect((await update).postDataJSON()).toMatchObject({ type: 1, iFrame: false, cache: true, hidden: false })
})

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
    await page.goto(`/smoke/${index}${view === 'generator/config' || view === 'generator/preview' ? '/sys_user' : ''}`)
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


test('typed forms in dictionary, scheduler and maintenance retain their defaults', async ({ page, context }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await mockApi(page)
  await context.addCookies([{ name: 'ELADMIN-TOEKN', value: 'test-token', domain: '127.0.0.1', path: '/' }])
  for (const view of ['system/dict/index', 'system/timing/index', 'maint/server/index', 'maint/app/index', 'maint/database/index', 'maint/deploy/index']) {
    await page.goto(`/smoke/${extraViews.indexOf(view)}`)
    await page.getByRole('button', { name: '新增', exact: true }).first().click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: '取消', exact: true }).click()
    await expect(dialog).not.toBeVisible()
  }
  await page.goto(`/smoke/${extraViews.indexOf('system/dict/index')}`)
  await page.getByText('user_status', { exact: true }).click()
  await page.getByRole('button', { name: '新增', exact: true }).last().click()
  await expect(page.getByRole('dialog')).toContainText('新增字典详情')
  await page.getByRole('dialog').getByRole('button', { name: '取消', exact: true }).click()
  expect(errors).toEqual([])
})

test('personal profile opens password and email forms without runtime errors', async ({ page, context }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await mockApi(page)
  await context.addCookies([{ name: 'ELADMIN-TOEKN', value: 'test-token', domain: '127.0.0.1', path: '/' }])
  await page.goto('/user/center')
  for (const title of ['修改密码', '修改邮箱']) {
    await page.getByText(title, { exact: true }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('dialog').getByRole('button', { name: '取消', exact: true }).click()
  }
  await page.getByRole('tab', { name: '操作日志' }).click()
  await expect(page.getByRole('columnheader', { name: '行为' })).toBeVisible()
  expect(errors).toEqual([])
})


test('shared CRUD validates and submits typed forms with the selected dictionary id', async ({ page, context }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await mockApi(page)
  await context.addCookies([{ name: 'ELADMIN-TOEKN', value: 'test-token', domain: '127.0.0.1', path: '/' }])
  await page.goto('/system/dept')
  await page.getByRole('button', { name: '新增', exact: true }).click()
  let dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: '确认', exact: true }).click()
  await expect(dialog.getByText('请输入名称')).toBeVisible()
  await dialog.getByLabel('部门名称').fill('类型迁移回归部门')
  const departmentRequest = page.waitForRequest(request => request.url().endsWith('/api/dept') && request.method() === 'POST')
  await dialog.getByRole('button', { name: '确认', exact: true }).click()
  expect((await departmentRequest).postDataJSON()).toMatchObject({ id: null, name: '类型迁移回归部门', pid: null, deptSort: 999 })
  await expect(dialog).not.toBeVisible()
  await page.getByRole('button', { name: '新增', exact: true }).click()
  await expect(page.getByRole('dialog').getByLabel('部门名称')).toHaveValue('')
  await page.getByRole('dialog').getByRole('button', { name: '取消', exact: true }).click()
  await page.goto(`/smoke/${extraViews.indexOf('system/dict/index')}`)
  await page.getByText('user_status', { exact: true }).click()
  await page.getByRole('button', { name: '新增', exact: true }).last().click()
  dialog = page.getByRole('dialog')
  await dialog.getByLabel('字典标签').fill('测试标签')
  await dialog.getByLabel('字典值', { exact: true }).fill('test')
  const detailRequest = page.waitForRequest(request => request.url().endsWith('/api/dictDetail') && request.method() === 'POST')
  await dialog.getByRole('button', { name: '确认', exact: true }).click()
  expect((await detailRequest).postDataJSON()).toMatchObject({ label: '测试标签', value: 'test', dict: { id: 1 } })
  await expect(dialog).not.toBeVisible()
  expect(errors).toEqual([])
})
