import type { DeploymentServerForm, DatabaseForm } from '@/types/business'
import request from '@/utils/request'

export function testDbConnect(data: DatabaseForm) {
  return request<boolean>({
    url: 'api/database/testConnect',
    method: 'post',
    data
  })
}

export function testServerConnect(data: DeploymentServerForm) {
  return request<boolean>({
    url: 'api/serverDeploy/testConnect',
    method: 'post',
    data
  })
}
