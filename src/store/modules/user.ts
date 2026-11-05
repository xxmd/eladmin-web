import type { Commit, Module } from 'vuex'
import { login, getInfo, logout } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import type { AuthInfo, UserInfo } from '@/types/api'

export interface UserState {
  token: string | undefined
  user: Partial<UserInfo>
  roles: string[]
  loadMenus: boolean
}
export interface LoginForm { username: string; password: string; code: string; uuid: string; rememberMe: boolean }
export function logOut(commit: Commit) {
  commit('SET_TOKEN', '')
  commit('SET_ROLES', [])
  commit('SET_USER', {})
  commit('SET_LOAD_MENUS', false)
  removeToken()
}
export function setUserInfo(info: AuthInfo, commit: Commit) {
  commit('SET_ROLES', info.roles.length ? info.roles : ['ROLE_SYSTEM_DEFAULT'])
  commit('SET_USER', info.user)
}
const user: Module<UserState, unknown> = {
  state: { token: getToken(), user: {}, roles: [], loadMenus: false },
  mutations: {
    SET_TOKEN(state, token: string) { state.token = token },
    SET_USER(state, value: Partial<UserInfo>) { state.user = value },
    SET_ROLES(state, roles: string[]) { state.roles = roles },
    SET_LOAD_MENUS(state, value: boolean) { state.loadMenus = value }
  },
  actions: {
    async Login({ commit }, form: LoginForm) {
      const result = await login(form.username, form.password, form.code, form.uuid)
      setToken(result.token, form.rememberMe)
      commit('SET_TOKEN', result.token)
      setUserInfo(result.user, commit)
      commit('SET_LOAD_MENUS', true)
    },
    async GetInfo({ commit }) {
      const result = await getInfo()
      setUserInfo(result, commit)
      return result
    },
    async LogOut({ commit }) {
      try { await logout() } finally { logOut(commit) }
    },
    updateLoadMenus({ commit }) { commit('SET_LOAD_MENUS', false) }
  }
}
export default user
