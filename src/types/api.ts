export type EntityId = number | string
export interface PageResult<T> { content: T[]; totalElements: number }
export interface PageQuery { page?: number; size?: number; sort?: string[] }
export interface Job {
  id: EntityId
  name: string
  jobSort: number
  enabled: boolean
  createTime?: string
}
export interface JobForm { id: EntityId | null; name: string; jobSort: number; enabled: boolean }
export interface JobQuery extends PageQuery { name?: string; enabled?: boolean | string; createTime?: string[] }
export interface DictEntry { id: EntityId; label: string; value: string; dictSort?: number }
export interface UserInfo {
  id: EntityId
  username: string
  nickName: string
  email: string
  phone: string
  avatarName?: string
  dept?: { id: EntityId; name: string }
}
export interface AuthInfo { user: UserInfo; roles: string[] }
export interface LoginResult { token: string; user: AuthInfo }
export interface Captcha { img: string; uuid: string }
