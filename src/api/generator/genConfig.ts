import type { GeneratorConfig } from '@/types/business'
import request from '@/utils/request'

export function get(tableName: string) {
  return request<GeneratorConfig>({
    url: 'api/genConfig/' + tableName,
    method: 'get'
  })
}

export function update(data: GeneratorConfig) {
  return request<GeneratorConfig>({
    url: 'api/genConfig',
    data,
    method: 'put'
  })
}
