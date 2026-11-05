import request from '@/utils/request'
import type { AuthInfo, Captcha, LoginResult } from '@/types/api'

export const login = (username: string, password: string, code: string, uuid: string) =>
  request<LoginResult>({ url: 'auth/login', method: 'post', data: { username, password, code, uuid } })
export const getInfo = () => request<AuthInfo>({ url: 'auth/info' })
export const getCodeImg = () => request<Captcha>({ url: 'auth/code' })
export const logout = () => request<void>({ url: 'auth/logout', method: 'delete' })
