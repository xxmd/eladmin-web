import Cookies from 'js-cookie'
import Config from '@/settings'

const TokenKey = Config.TokenKey

export function getToken() {
  return localStorage.getItem(TokenKey) ?? Cookies.get(TokenKey)
}

export function setToken(token: string, rememberMe: boolean) {
  if (rememberMe) {
    localStorage.setItem(TokenKey, token)
    Cookies.remove(TokenKey)
  } else {
    localStorage.removeItem(TokenKey)
    Cookies.set(TokenKey, token)
  }
}

export function removeToken() {
  localStorage.removeItem(TokenKey)
  Cookies.remove(TokenKey)
}
