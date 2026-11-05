
<template>
  <!-- eslint-disable vue/require-component-is -->
  <component :is="linkProps(to).is" v-bind="linkProps(to)">
    <slot />
  </component>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { isExternal } from '@/utils/validate'

export default defineComponent({
  props: {
    to: {
      type: String,
      required: true
    }
  },
  methods: {
    linkProps(url: string) {
      if (isExternal(url)) {
        return {
          is: 'a',
          href: url,
          target: '_blank',
          rel: 'noopener'
        }
      }
      return {
        is: 'router-link',
        to: url
      }
    }
  }
})
</script>
