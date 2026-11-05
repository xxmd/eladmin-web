import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AxiosError, AxiosHeaders } from 'axios'
vi.mock('@/router/routers', () => ({ default: { push: vi.fn() } }))
vi.mock('@/store', () => ({ default: { dispatch: vi.fn().mockResolvedValue(undefined) } }))
vi.mock('@/utils/auth', () => ({ getToken: () => 'test-token' }))
vi.mock('element-plus', () => ({ ElNotification: { error: vi.fn() } }))
import request, { service } from '@/utils/request'
import { ElNotification } from 'element-plus'

describe('request contract', () => {
  beforeEach(() => vi.clearAllMocks())
  it('unwraps the body and retains auth headers and repeated query keys', async () => {
    service.defaults.adapter = async config => {
      expect(config.headers.get('Authorization')).toBe('test-token')
      expect(service.getUri(config)).toContain('sort=id,desc&sort=name,asc')
      return { data: { content: [], totalElements: 0 }, status: 200, statusText: 'OK', headers: new AxiosHeaders(), config }
    }
    expect(await request({ url: '/api/test', params: { sort: ['id,desc', 'name,asc'] } })).toEqual({ content: [], totalElements: 0 })
  })
  it('preserves Blob downloads', async () => {
    const blob = new Blob(['test'])
    service.defaults.adapter = async config => ({ data: blob, status: 200, statusText: 'OK', headers: new AxiosHeaders(), config })
    expect(await request({ url: '/api/download', responseType: 'blob' })).toBe(blob)
  })
  it('handles a network failure with no response', async () => {
    service.defaults.adapter = async () => { throw new AxiosError('Network Error', 'ERR_NETWORK') }
    await expect(request({ url: '/api/test' })).rejects.toThrow('Network Error')
    expect(ElNotification.error).toHaveBeenCalledWith({ title: '接口请求失败', duration: 5000 })
  })
  it('reports server validation messages', async () => {
    service.defaults.adapter = async config => { throw new AxiosError('Bad request', 'ERR_BAD_REQUEST', config, undefined, { data: { message: '岗位已存在' }, status: 400, statusText: 'Bad Request', headers: new AxiosHeaders(), config }) }
    await expect(request({ url: '/api/job' })).rejects.toThrow()
    expect(ElNotification.error).toHaveBeenCalledWith({ title: '岗位已存在', duration: 5000 })
  })
})
