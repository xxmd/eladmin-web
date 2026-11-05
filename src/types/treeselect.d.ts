declare module '@zanmato/vue3-treeselect' {
  import type { DefineComponent } from 'vue'
  interface Option { id: string | number; label?: string; children?: Option[] | null; isDisabled?: boolean }
  const Treeselect: DefineComponent<{ modelValue?: string | number | Array<string | number> | null; options?: Option[]; multiple?: boolean; clearable?: boolean; disabled?: boolean; placeholder?: string }>
  export const LOAD_CHILDREN_OPTIONS: string
  export default Treeselect
}
