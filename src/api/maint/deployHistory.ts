import type { EntityId } from '@/types/api'
import type { DeploymentHistory } from '@/types/business'
import request from '@/utils/request'

export function del(ids: EntityId[]) {
  return request<void>({
    url: 'api/deployHistory',
    method: 'delete',
    data: ids
  })
}

/**
 * 版本回退
 * @param data 选中行
 */
export function reducte(data: DeploymentHistory) {
  return request<void>({
    url: 'api/deploy/serverReduction',
    method: 'post',
    data
  })
}
