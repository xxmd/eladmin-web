<template>
  <el-scrollbar ref="scrollContainer" :vertical="false" class="scroll-container" @wheel.prevent="handleScroll">
    <slot />
  </el-scrollbar>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ScrollbarInstance } from 'element-plus'
const scrollContainer = ref<ScrollbarInstance>()
function handleScroll(event: WheelEvent) {
  const wrapper = scrollContainer.value?.wrapRef
  if (wrapper) wrapper.scrollLeft -= event.deltaY * 10
}
function moveToTarget(tag: { $el: HTMLElement }) {
  const wrapper = scrollContainer.value?.wrapRef
  if (!wrapper) return
  const element = tag.$el
  const left = element.offsetLeft - 4
  const right = element.offsetLeft + element.offsetWidth + 4
  if (left < wrapper.scrollLeft) wrapper.scrollLeft = left
  else if (right > wrapper.scrollLeft + wrapper.clientWidth) wrapper.scrollLeft = right - wrapper.clientWidth
}
defineExpose({ moveToTarget })
</script>

<style lang="scss" scoped>
.scroll-container {
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  width: 100%;
 :deep(*) {
    .el-scrollbar__bar {
      bottom: 0px;
    }
    .el-scrollbar__wrap {
      height: 49px;
    }
  }
}
</style>
