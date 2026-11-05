import type { EntityId, PageResult } from '@/types/api'
import type { Department, DepartmentForm, DepartmentQuery } from '@/types/business'
import request from '@/utils/request'

export function getDepts(params: DepartmentQuery = {}) {
  return request<PageResult<Department>>({
    url: 'api/dept',
    method: 'get',
    params
  })
}

export function getDeptSuperior(ids: EntityId | EntityId[], exclude = false) {
  exclude = exclude !== undefined ? exclude : false
  const data = Array.isArray(ids) ? ids : [ids]
  return request<PageResult<Department>>({
    url: 'api/dept/superior?exclude=' + exclude,
    method: 'post',
    data
  })
}

export function add(data: DepartmentForm) {
  return request<void>({
    url: 'api/dept',
    method: 'post',
    data
  })
}

export function del(ids: EntityId[]) {
  return request<void>({
    url: 'api/dept',
    method: 'delete',
    data: ids
  })
}

export function edit(data: DepartmentForm) {
  return request<void>({
    url: 'api/dept',
    method: 'put',
    data
  })
}

export default { add, edit, del, getDepts, getDeptSuperior }
