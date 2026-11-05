import type { AlipayConfig, PaymentRequest } from '@/types/business'
import request from '@/utils/request'

export function get() {
  return request<AlipayConfig>({
    url: 'api/aliPay',
    method: 'get'
  })
}

export function update(data: AlipayConfig) {
  return request<void>({
    url: 'api/aliPay',
    data,
    method: 'put'
  })
}

// 支付
export function toAliPay(url: string, data: PaymentRequest) {
  return request<string>({
    url: 'api/' + url,
    data,
    method: 'post'
  })
}
