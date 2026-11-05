import type { EntityId } from '@/types/api'
import type { DeploymentServerForm } from '@/types/business'
import request from '@/utils/request'

export function add(data: DeploymentServerForm) {
  return request<void>({
    url: 'api/serverDeploy',
    method: 'post',
    data
  })
}

export function del(ids: EntityId[]) {
  return request<void>({
    url: 'api/serverDeploy',
    method: 'delete',
    data: ids
  })
}

export function edit(data: DeploymentServerForm) {
  return request<void>({
    url: 'api/serverDeploy',
    method: 'put',
    data
  })
}

export default { add, edit, del }
