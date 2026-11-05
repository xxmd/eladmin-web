<template>
  <elFrame :src="sqlApi" />
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { mapGetters } from 'vuex'
import elFrame from '@/components/Iframe/index.vue'
export default defineComponent({
  name: 'Sql',
  components: { elFrame },
  computed: {
    ...mapGetters([
      'sqlApi'
    ])
  }
})
</script>
