import type { EntityId } from '@/types/api'
import type { EntityRef, Role, RoleForm } from '@/types/business'
import request from '@/utils/request'

// 获取所有的Role
export function getAll() {
  return request<Role[]>({
    url: 'api/roles/all',
    method: 'get'
  })
}

export function add(data: RoleForm) {
  return request<void>({
    url: 'api/roles',
    method: 'post',
    data
  })
}

export function get(id: EntityId) {
  return request<Role>({
    url: 'api/roles/' + id,
    method: 'get'
  })
}

export function getLevel() {
  return request<{ level: number }>({
    url: 'api/roles/level',
    method: 'get'
  })
}

export function del(ids: EntityId[]) {
  return request<void>({
    url: 'api/roles',
    method: 'delete',
    data: ids
  })
}

export function edit(data: RoleForm) {
  return request<void>({
    url: 'api/roles',
    method: 'put',
    data
  })
}

export function editMenu(data: { id: EntityId; menus: EntityRef[] }) {
  return request<void>({
    url: 'api/roles/menu',
    method: 'put',
    data
  })
}

export default { add, edit, del, get, editMenu, getLevel }
