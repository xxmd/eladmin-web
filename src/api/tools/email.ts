import type { EmailConfig, EmailMessage } from '@/types/business'
import request from '@/utils/request'

export function get() {
  return request<EmailConfig>({
    url: 'api/email',
    method: 'get'
  })
}

export function update(data: EmailConfig) {
  return request<void>({
    url: 'api/email',
    data,
    method: 'put'
  })
}

export function send(data: EmailMessage) {
  return request<void>({
    url: 'api/email',
    data,
    method: 'post'
  })
}
