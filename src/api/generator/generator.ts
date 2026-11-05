import type { GeneratorColumn, GeneratorTable, GeneratedFile } from '@/types/business'
import request from '@/utils/request'

export function getAllTable() {
  return request<GeneratorTable[]>({
    url: 'api/generator/tables/all',
    method: 'get'
  })
}

export function generator(tableName: string, type: 0): Promise<void>
export function generator(tableName: string, type: 1): Promise<GeneratedFile[]>
export function generator(tableName: string, type: 2): Promise<Blob>
export function generator(tableName: string, type: 0 | 1 | 2) {
  return request<Blob | GeneratedFile[] | void>({
    url: 'api/generator/' + tableName + '/' + type,
    method: 'post',
    responseType: type === 2 ? 'blob' : 'json'
  })
}

export function save(data: GeneratorColumn[]) {
  return request<void>({
    url: 'api/generator',
    data,
    method: 'put'
  })
}

export function sync(tables: string[]) {
  return request<void>({
    url: 'api/generator/sync',
    method: 'post',
    data: tables
  })
}


