<template>
  <el-color-picker v-model="theme" :predefine="['#409EFF', '#1890ff', '#304156', '#212121', '#11a983', '#13c2c2', '#6959CD', '#f5222d']" class="theme-picker" />
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useStore } from 'vuex'
import Cookies from 'js-cookie'
const store = useStore()
const emit = defineEmits<{ change: [color: string] }>()
const theme = ref<string>(Cookies.get('theme') || store.state.settings.theme)
watch(theme, color => {
  if (!/^#[\da-f]{6}$/i.test(color)) return
  const rgb = [1, 3, 5].map(offset => parseInt(color.slice(offset, offset + 2), 16))
  const mix = (target: number, ratio: number) => '#' + rgb.map(value => Math.round(value + (target - value) * ratio).toString(16).padStart(2, '0')).join('')
  const style = document.documentElement.style
  style.setProperty('--el-color-primary', color)
  style.setProperty('--el-color-primary-rgb', rgb.join(', '))
  for (let step = 1; step <= 9; step++) style.setProperty(`--el-color-primary-light-${step}`, mix(255, step / 10))
  style.setProperty('--el-color-primary-dark-2', mix(0, 0.2))
  Cookies.set('theme', color, { expires: 365 })
  void store.dispatch('settings/changeSetting', { key: 'theme', value: color })
  emit('change', color)
}, { immediate: true })
defineExpose({ theme })
</script>
<style scoped>
.theme-picker :deep(.el-color-picker__trigger) { height: 26px; width: 26px; padding: 2px; }
</style>
