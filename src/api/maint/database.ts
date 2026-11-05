import type { EntityId } from '@/types/api'
import type { DatabaseForm } from '@/types/business'
import request from '@/utils/request'

export function add(data: DatabaseForm) {
  return request<void>({
    url: 'api/database',
    method: 'post',
    data
  })
}

export function del(ids: EntityId[]) {
  return request<void>({
    url: 'api/database',
    method: 'delete',
    data: ids
  })
}

export function edit(data: DatabaseForm) {
  return request<void>({
    url: 'api/database',
    method: 'put',
    data
  })
}

export function testDbConnection(data: DatabaseForm) {
  return request<boolean>({
    url: 'api/database/testConnect',
    method: 'post',
    data
  })
}

export default { add, edit, del, testDbConnection }
