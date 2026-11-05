<template>
  <el-date-picker
    v-bind="$attrs"
    :model-value="modelValue"
    type="daterange"
    value-format="YYYY-MM-DD HH:mm:ss"
    :default-time="defaultTime"
    :shortcuts="shortcuts"
    range-separator=":"
    start-placeholder="开始日期"
    end-placeholder="结束日期"

    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>
<script setup lang="ts">
import { computed } from 'vue'
defineOptions({ inheritAttrs: false })
const props = defineProps<{ modelValue?: string[] | null }>()
defineEmits<{ 'update:modelValue': [value: string[] | null] }>()
const defaultTime = [new Date(2000, 0, 1, 0, 0, 0), new Date(2000, 0, 1, 23, 59, 59)]
function range(start: Date, end = new Date()) {
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 0)
  return [start, end]
}
function daysAgo(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}
function shift(days: number) {
  const dates = props.modelValue?.length === 2 ? props.modelValue.map(value => new Date(value.replace(' ', 'T'))) : range(new Date())
  return dates.map(date => { date.setDate(date.getDate() + days); return date })
}
const shortcuts = computed(() => [
  { text: '今天', value: () => range(new Date()) },
  { text: '昨天', value: () => range(daysAgo(1), daysAgo(1)) },
  { text: '本周', value: () => range(daysAgo((new Date().getDay() + 6) % 7)) },
  { text: '这个月', value: () => range(new Date(new Date().getFullYear(), new Date().getMonth(), 1)) },
  { text: '当前季度', value: () => range(new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3, 1)) },
  { text: '最近30天', value: () => range(daysAgo(30)) },
  { text: '‹ 往前一天', value: () => shift(-1) },
  { text: '往后一天 ›', value: () => shift(1) }
])
</script>
