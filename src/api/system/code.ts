import request from '@/utils/request'

export function resetEmail(data: string) {
  return request<void>({
    url: 'api/code/resetEmail?email=' + data,
    method: 'post'
  })
}

export function updatePass(pass: string) {
  return request<void>({
    url: 'api/users/updatePass/' + pass,
    method: 'get'
  })
}
