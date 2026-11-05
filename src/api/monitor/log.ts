import type { EntityId } from '@/types/api'
import request from '@/utils/request'

export function getErrDetail(id: EntityId) {
  return request<{ exception: string }>({
    url: 'api/logs/error/' + id,
    method: 'get'
  })
}

export function delAllError() {
  return request<void>({
    url: 'api/logs/del/error',
    method: 'delete'
  })
}

export function delAllInfo() {
  return request<void>({
    url: 'api/logs/del/info',
    method: 'delete'
  })
}
