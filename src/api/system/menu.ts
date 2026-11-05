import type { MenuRoute } from '@/router/menu'
import type { EntityId, PageResult } from '@/types/api'
import type { Menu, MenuForm, MenuQuery } from '@/types/business'
import request from '@/utils/request'

export function getMenusTree(pid: EntityId) {
  return request<Menu[]>({
    url: 'api/menus/lazy?pid=' + pid,
    method: 'get'
  })
}

export function getMenus(params: MenuQuery = {}) {
  return request<PageResult<Menu>>({
    url: 'api/menus',
    method: 'get',
    params
  })
}

export function getMenuSuperior(ids: EntityId | EntityId[]) {
  const data = Array.isArray(ids) ? ids : [ids]
  return request<Menu[]>({
    url: 'api/menus/superior',
    method: 'post',
    data
  })
}

export function getChild(id: EntityId) {
  return request<EntityId[]>({
    url: 'api/menus/child?id=' + id,
    method: 'get'
  })
}

export function buildMenus() {
  return request<MenuRoute[]>({
    url: 'api/menus/build',
    method: 'get'
  })
}

export function add(data: MenuForm) {
  return request<void>({
    url: 'api/menus',
    method: 'post',
    data
  })
}

export function del(ids: EntityId[]) {
  return request<void>({
    url: 'api/menus',
    method: 'delete',
    data: ids
  })
}

export function edit(data: MenuForm) {
  return request<void>({
    url: 'api/menus',
    method: 'put',
    data
  })
}

export default { add, edit, del, getMenusTree, getMenuSuperior, getMenus, getChild }
