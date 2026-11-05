import request from '@/utils/request'
import type { EntityId, Job, JobForm, JobQuery, PageResult } from '@/types/api'

export const list = (params: JobQuery) => request<PageResult<Job>>({ url: 'api/job', params })
export const getAllJob = () => list({ page: 0, size: 9999, enabled: true })
export const add = (data: JobForm) => request<void>({ url: 'api/job', method: 'post', data })
export const edit = (data: JobForm) => request<void>({ url: 'api/job', method: 'put', data })
export const del = (ids: EntityId[]) => request<void>({ url: 'api/job', method: 'delete', data: ids })
export default { add, edit, del }
