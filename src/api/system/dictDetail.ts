import request from '@/utils/request'
import type { DictEntry, EntityId, PageResult } from '@/types/api'

export interface DictForm {
  id: EntityId | null
  label: string | null
  value: string | null
  dictSort: number
  dict?: { id: EntityId | null }
}
export const get = (dictName: string) => request<PageResult<DictEntry>>({ url: 'api/dictDetail', params: { dictName, page: 0, size: 9999 } })
export const getDictMap = (dictName: string) => request<Record<string, string>>({ url: 'api/dictDetail/map', params: { dictName, page: 0, size: 9999 } })
export const add = (data: DictForm) => request<void>({ url: 'api/dictDetail', method: 'post', data })
export const edit = (data: DictForm) => request<void>({ url: 'api/dictDetail', method: 'put', data })
export async function del(ids: EntityId | EntityId[]): Promise<void> {
  await Promise.all((Array.isArray(ids) ? ids : [ids]).map(id => request<void>({ url: `api/dictDetail/${id}`, method: 'delete' })))
}
export default { add, edit, del }
