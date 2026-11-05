import type { EntityId } from '@/types/api'
import request from '@/utils/request'

export function download(id: EntityId) {
  return request<{ url: string }>({
    url: 'api/s3Storage/download/' + id,
    method: 'get'
  })
}

export function del(ids: EntityId[]) {
  return request<void>({
    url: 'api/s3Storage',
    method: 'delete',
    data: ids
  })
}

export default { del, download }
