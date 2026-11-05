import { get } from '@/api/system/dictDetail'
import type { DictEntry } from '@/types/api'

export interface DictState {
  user_status?: DictEntry[]; dept_status?: DictEntry[]; job_status?: DictEntry[]; user_sex?: DictEntry[]
  dict: Record<string, Record<string, DictEntry>>
  label: Record<string, Record<string, string>>
  [name: string]: unknown
}
export default class Dict {
  constructor(private readonly dict: DictState) {}
  async init(names: string[], complete: () => void) {
    await Promise.all(names.map(async name => {
      this.dict.dict[name] = {}
      this.dict.label[name] = {}
      this.dict[name] = []
      const { content } = await get(name)
      this.dict[name] = content
      for (const item of content) {
        this.dict.dict[name][item.value] = item
        this.dict.label[name][item.value] = item.label
      }
    }))
    complete()
  }
}
