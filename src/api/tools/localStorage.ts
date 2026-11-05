import type { EntityId } from '@/types/api'
import type { LocalFile, LocalFileForm } from '@/types/business'
import request from '@/utils/request'

export function add(data: FormData) {
  return request<LocalFile>({
    url: 'api/localStorage',
    method: 'post',
    data
  })
}

export function del(ids: EntityId[]) {
  return request<void>({
    url: 'api/localStorage/',
    method: 'delete',
    data: ids
  })
}

export function edit(data: LocalFileForm) {
  return request<void>({
    url: 'api/localStorage',
    method: 'put',
    data
  })
}

export default { add, edit, del }
