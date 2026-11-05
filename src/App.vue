<template>
  <el-config-provider :size="size">
    <router-view />
  </el-config-provider>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
const store = useStore()
const size = computed(() => {
  const value: string = store.getters.size
  return value === 'large' ? 'large' : value === 'default' || value === 'medium' ? 'default' : 'small'
})
</script>
