import type { EntityId } from '@/types/api'
import type { ScheduledJobForm } from '@/types/business'
import request from '@/utils/request'

export function add(data: ScheduledJobForm) {
  return request<void>({
    url: 'api/jobs',
    method: 'post',
    data
  })
}

export function del(ids: EntityId[]) {
  return request<void>({
    url: 'api/jobs',
    method: 'delete',
    data: ids
  })
}

export function edit(data: ScheduledJobForm) {
  return request<void>({
    url: 'api/jobs',
    method: 'put',
    data
  })
}

export function updateIsPause(id: EntityId) {
  return request<void>({
    url: 'api/jobs/' + id,
    method: 'put'
  })
}

export function execution(id: EntityId) {
  return request<void>({
    url: 'api/jobs/exec/' + id,
    method: 'put'
  })
}

export default { del, updateIsPause, execution, add, edit }
