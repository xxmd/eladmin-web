import axios, { type AxiosRequestConfig } from 'axios'
import { ElNotification } from 'element-plus'
import router from '@/router/routers'
import store from '@/store'
import { getToken } from '@/utils/auth'
import Config from '@/settings'
import Cookies from 'js-cookie'

export const service = axios.create({
  baseURL: import.meta.env.PROD ? import.meta.env.VITE_BASE_API : '/',
  paramsSerializer: { indexes: null },
  timeout: Config.timeout
})

service.interceptors.request.use(config => {
  const token = getToken()
  if (token) config.headers.set('Authorization', token)
  if (!(config.data instanceof FormData)) config.headers.set('Content-Type', 'application/json')
  return config
})

export function errorMessage(data: unknown): string | undefined {
  if (typeof data === 'object' && data !== null && 'message' in data && typeof data.message === 'string') return data.message
}

service.interceptors.response.use(response => response, async (error: unknown) => {
  let title = '接口请求失败'
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    if (status === 401 && !error.config?.url?.includes('auth/logout')) {
      await store.dispatch('LogOut').catch(() => undefined)
      Cookies.set('point', '401')
      window.location.reload()
    } else if (status === 403) {
      void router.push('/401')
    }
    let data: unknown = error.response?.data
    if (data instanceof Blob && data.type.includes('json')) {
      try { data = JSON.parse(await data.text()) } catch { data = undefined }
    }
    title = errorMessage(data) || (error.code === 'ECONNABORTED' ? '网络请求超时' : title)
  }
  ElNotification.error({ title, duration: 5000 })
  return Promise.reject(error)
})

/** The public request API resolves the response body, including Blob downloads. */
export default async function request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
  const response = await service.request<T>(config)
  return response.data
}
