<template>
  <el-dialog append-to-body :close-on-click-modal="false" v-model="dialog" title="应用部署" width="400px">
    <el-form ref="form" :model="form" :rules="rules">
      <el-upload
        :action="deployUploadApi"
        :data="deployInfo"
        :headers="headers"
        :on-success="handleSuccess"
        :on-error="handleError"
        class="upload-demo"
        drag
      >
        <IconUpload class="legacy-icon " />
        <div class="el-upload__text">
          将文件拖到此处，或
          <em>点击上传</em>
        </div>
        <template #tip><div  class="el-upload__tip">多个应用上传文件名称为all.zip,数据库更新脚本扩展名为.sql,上传成功后系统自动部署系统。</div></template>
      </el-upload>
    </el-form>
    <template #footer><div  class="dialog-footer">
      <el-button type="primary" @click="cancel">关闭</el-button>
    </div></template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ElNotification } from 'element-plus'
import { useStore } from '@/store'
import { getToken } from '@/utils/auth'
import type { Deployment } from '@/types/business'
const dialog = ref(false)
const form = ref({})
const rules = {}
const deployInfo = ref<Partial<Deployment>>({})
const headers = { Authorization: getToken() || '' }
const deployUploadApi = useStore().state.api.deployUploadApi
let socket: WebSocket | undefined
function cancel() { dialog.value = false }
function handleSuccess() { cancel() }
function handleError(error: Error) { ElNotification({ title: error.message, type: 'error', duration: 2500 }) }
onMounted(() => {
  const base = import.meta.env.VITE_WS_API === '/' ? `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}` : import.meta.env.VITE_WS_API
  socket = new WebSocket(base.replace(/\/$/, '') + '/webSocket/deploy')
  socket.onerror = () => ElNotification({ title: 'WebSocket连接发生错误', type: 'error', duration: 0 })
  socket.onmessage = (event: MessageEvent<string>) => {
    let data: unknown
    try { data = JSON.parse(event.data) } catch { return }
    if (!data || typeof data !== 'object' || !('msg' in data) || typeof data.msg !== 'string' || !('msgType' in data)) return
    if (data.msgType === 'INFO' || data.msgType === 'ERROR') ElNotification({ message: data.msg, type: data.msgType === 'INFO' ? 'success' : 'error', duration: data.msgType === 'INFO' ? 5500 : 0 })
  }
})
onBeforeUnmount(() => socket?.close())
defineExpose({ dialog, deployInfo })
</script>

<style scoped>
</style>
