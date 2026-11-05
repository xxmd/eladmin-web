import type { EntityId } from '@/types/api'
import type { Dictionary, DictionaryForm } from '@/types/business'
import request from '@/utils/request'

export function getDicts() {
  return request<Dictionary[]>({
    url: 'api/dict/all',
    method: 'get'
  })
}

export function add(data: DictionaryForm) {
  return request<void>({
    url: 'api/dict',
    method: 'post',
    data
  })
}

export function del(ids: EntityId[]) {
  return request<void>({
    url: 'api/dict/',
    method: 'delete',
    data: ids
  })
}

export function edit(data: DictionaryForm) {
  return request<void>({
    url: 'api/dict',
    method: 'put',
    data
  })
}

export default { add, edit, del }
