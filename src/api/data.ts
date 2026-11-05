import request from '@/utils/request'
import qs from 'qs'
import type { PageResult } from '@/types/api'

export function initData<Row = Record<string, unknown>>(url: string, params: object) {
  return request<PageResult<Row>>({ url: url + '?' + qs.stringify(params, { indices: false }), method: 'get' })
}
export function download(url: string, params: object) {
  return request<Blob>({ url: url + '?' + qs.stringify(params, { indices: false }), method: 'get', responseType: 'blob' })
}
