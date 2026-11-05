<template>
  <svg-icon v-if="icon" :icon-class="icon" />
  <span v-if="title">{{ title }}</span>
</template>
<script setup lang="ts">
defineProps<{ icon?: string; title?: string }>()
</script>
