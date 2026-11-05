import request from '@/utils/request'

export function del(keys: string[]) {
  return request<void>({
    url: 'auth/online',
    method: 'delete',
    data: keys
  })
}
