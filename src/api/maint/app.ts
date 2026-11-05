import type { EntityId } from '@/types/api'
import type { DeploymentAppForm } from '@/types/business'
import request from '@/utils/request'

export function add(data: DeploymentAppForm) {
  return request<void>({
    url: 'api/app',
    method: 'post',
    data
  })
}

export function del(ids: EntityId[]) {
  return request<void>({
    url: 'api/app',
    method: 'delete',
    data: ids
  })
}

export function edit(data: DeploymentAppForm) {
  return request<void>({
    url: 'api/app',
    method: 'put',
    data
  })
}

export default { add, edit, del }
