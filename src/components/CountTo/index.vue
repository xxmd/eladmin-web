<template><span>{{ Math.round(value).toLocaleString() }}</span></template>
<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
const props = withDefaults(defineProps<{ startVal?: number; endVal: number; duration?: number }>(), { startVal: 0, duration: 1500 })
const value = ref(props.startVal)
let frame = 0
watch(() => [props.startVal, props.endVal, props.duration], () => {
  cancelAnimationFrame(frame)
  const start = performance.now()
  const tick = (now: number) => {
    const progress = Math.min(1, (now - start) / Math.max(1, props.duration))
    value.value = props.startVal + (props.endVal - props.startVal) * (1 - (1 - progress) ** 3)
    if (progress < 1) frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)
}, { immediate: true })
onBeforeUnmount(() => cancelAnimationFrame(frame))
</script>
