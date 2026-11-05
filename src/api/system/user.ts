import type { EntityId } from '@/types/api'
import type { UserForm, UserProfile, PasswordForm, EmailChangeForm } from '@/types/business'
import request from '@/utils/request'
import { encrypt } from '@/utils/rsaEncrypt'

export function add(data: UserForm) {
  return request<void>({
    url: 'api/users',
    method: 'post',
    data
  })
}

export function del(ids: EntityId[]) {
  return request<void>({
    url: 'api/users',
    method: 'delete',
    data: ids
  })
}

export function edit(data: UserForm) {
  return request<void>({
    url: 'api/users',
    method: 'put',
    data
  })
}

export function editUser(data: UserProfile) {
  return request<void>({
    url: 'api/users/center',
    method: 'put',
    data
  })
}

export function updatePass(user: PasswordForm) {
  const data = {
    oldPass: encrypt(user.oldPass),
    newPass: encrypt(user.newPass)
  }
  return request<void>({
    url: 'api/users/updatePass/',
    method: 'post',
    data
  })
}

export function resetPwd(ids: EntityId[]) {
  return request<void>({
    url: 'api/users/resetPwd',
    method: 'put',
    data: ids
  })
}

export function updateEmail(form: EmailChangeForm) {
  const data = {
    password: encrypt(form.pass),
    email: form.email
  }
  return request<void>({
    url: 'api/users/updateEmail/' + form.code,
    method: 'post',
    data
  })
}

export default { add, edit, del, resetPwd }

