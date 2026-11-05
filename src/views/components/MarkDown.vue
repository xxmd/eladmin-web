<template>
  <div class="app-container">
    <p class="warn-content">Markdown 编辑器</p>
    <MdEditor v-model="content" :style="{ height: 'calc(100vh - 200px)' }" @on-upload-img="uploadImages" />
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { upload } from '@/utils/upload'
defineOptions({ name: 'Markdown' })
const content = ref('')
const store = useStore()
async function uploadImages(files: File[], callback: (urls: string[]) => void) {
  try {
    const urls = await Promise.all(files.map(async file => {
      const { data } = await upload(store.getters.imagesUploadApi, file)
      return `${store.getters.baseApi}/file/${data.type}/${data.realName}`
    }))
    callback(urls)
  } catch { ElMessage.error('图片上传失败') }
}
</script>
