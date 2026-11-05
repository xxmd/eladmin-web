import { onMounted, ref } from 'vue'
import request from '@/utils/request'
import type { DictEntry, PageResult } from '@/types/api'

export function useDict(name: string) {
  const entries = ref<DictEntry[]>([])
  async function reload() {
    const result = await request<PageResult<DictEntry>>({ url: 'api/dictDetail', params: { dictName: name, page: 0, size: 9999 } })
    entries.value = result.content
  }
  onMounted(() => { void reload().catch(() => undefined) })
  return { entries, reload }
}
