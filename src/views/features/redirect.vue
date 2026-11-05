<template><span /></template>
<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const path = route.params.path
void useRouter().replace({ path: '/' + (Array.isArray(path) ? path.join('/') : path), query: route.query })
</script>
