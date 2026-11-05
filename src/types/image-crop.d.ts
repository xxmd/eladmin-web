// This Vue 3 package ships its component without an exported declaration.
declare module 'vue-image-crop-upload' {
  import type { DefineComponent } from 'vue'
  const Upload: DefineComponent<{ modelValue?: boolean; url?: string; headers?: Record<string, string | undefined>; field?: string; width?: number; height?: number; imgFormat?: string }>
  export default Upload
}
