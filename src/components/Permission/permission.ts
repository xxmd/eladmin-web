import type { ObjectDirective } from 'vue'
import { checkPer } from '@/utils/permission'

const permission: ObjectDirective<HTMLElement, string[] | undefined> = {
  mounted(element, binding) {
    if (binding.value == null || binding.value.length === 0) return
    if (!Array.isArray(binding.value)) throw new Error('v-permission 需要权限数组')
    if (!checkPer(binding.value)) element.remove()
  }
}
export default permission
