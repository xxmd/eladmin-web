<template>
  <div>
    <svg-icon icon-class="doc" @click="click" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'Doc',
  methods: {
    click() {
      window.open('https://eladmin.vip/pages/010101/', '_blank')
    }
  }
})
</script>
