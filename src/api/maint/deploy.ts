import type { EntityId, PageResult } from '@/types/api'
import type { DeploymentApp, DeploymentServer, Deployment, DeploymentForm } from '@/types/business'
import request from '@/utils/request'

export function add(data: DeploymentForm) {
  return request<void>({
    url: 'api/deploy',
    method: 'post',
    data
  })
}

export function del(ids: EntityId[]) {
  return request<void>({
    url: 'api/deploy',
    method: 'delete',
    data: ids
  })
}

export function edit(data: DeploymentForm) {
  return request<void>({
    url: 'api/deploy',
    method: 'put',
    data
  })
}

export function getApps() {
  return request<PageResult<DeploymentApp>>({
    url: 'api/app',
    method: 'get'
  })
}

export function getServers() {
  return request<PageResult<DeploymentServer>>({
    url: 'api/serverDeploy',
    method: 'get'
  })
}

/**
 * 启动服务
 * @param data 选中行
 */
export function startServer(data: Deployment) {
  return request<void>({
    url: 'api/deploy/startServer',
    method: 'post',
    data
  })
}

/**
 * 停止服务
 * @param data  选中行
 */
export function stopServer(data: Deployment) {
  return request<void>({
    url: 'api/deploy/stopServer',
    method: 'post',
    data
  })
}

/**
 * 停止服务
 * @param data  选中行
 */
export function serverStatus(data: Deployment) {
  return request<void>({
    url: 'api/deploy/serverStatus',
    method: 'post',
    data
  })
}

export default { add, edit, del, stopServer, serverStatus, startServer, getServers, getApps }
