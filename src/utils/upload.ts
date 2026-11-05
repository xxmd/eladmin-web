import axios from 'axios'
import { getToken } from '@/utils/auth'

export function upload(api: string, file: File) {
  const data = new FormData()
  data.append('file', file)
  const config = {
    headers: { 'Authorization': getToken() }
  }
  return axios.post<{ type: string; realName: string }>(api, data, config)
}
