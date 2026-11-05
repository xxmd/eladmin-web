<template>
  <div style="border: 1px solid #ccc">
    <Toolbar :editor="editor" :default-config="{}" mode="simple" style="border-bottom: 1px solid #ccc" />
    <Editor v-model="content" :default-config="config" mode="simple" :style="{ height: editorHeight + 'px', overflowY: 'hidden' }" @on-created="onCreated" />
  </div>
</template>
<script setup lang="ts">
import { computed, shallowRef, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import { Toolbar, Editor } from '@wangeditor/editor-for-vue'
import type { IDomEditor, IEditorConfig } from '@wangeditor/editor'
import { upload } from '@/utils/upload'
import '@wangeditor/editor/dist/css/style.css'
const props = withDefaults(defineProps<{ modelValue?: string; editorHeight?: number }>(), { modelValue: '', editorHeight: 420 })
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const store = useStore()
const editor = shallowRef<IDomEditor>()
const content = computed({ get: () => props.modelValue, set: value => emit('update:modelValue', value) })
const config: Partial<IEditorConfig> = {
  placeholder: '请输入内容...',
  MENU_CONF: { uploadImage: {
    allowedFileTypes: ['image/*'],
    async customUpload(file: File, insert: (url: string, alt: string, href: string) => void) {
      const { data } = await upload(store.getters.imagesUploadApi, file)
      insert(`${store.getters.baseApi}/file/${data.type}/${data.realName}`, '', '')
    }
  } }
}
function onCreated(instance: IDomEditor) { editor.value = instance }
onBeforeUnmount(() => editor.value?.destroy())
</script>
