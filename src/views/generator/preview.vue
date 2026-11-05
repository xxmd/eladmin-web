<template>
  <el-tabs v-model="activeName" type="card">
    <el-tab-pane v-for="item in data" :key="item.name" :lazy="true" :label="item.name" :name="item.name">
      <Java :model-value="item.content" :height="height" />
    </el-tab-pane>
  </el-tabs>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { GeneratedFile } from '@/types/business'
import Java from '@/components/JavaEdit/index.vue'
import { generator } from '@/api/generator/generator'
export default defineComponent({
  name: 'Preview',
  components: { Java },
  data() {
    return {
      data: null as GeneratedFile[] | null, height: '', activeName: 'Entity'
    }
  },
  created() {
    this.height = document.documentElement.clientHeight - 180 + 'px'
    const tableName = String(this.$route.params.tableName)
    generator(tableName, 1).then(data => {
      this.data = data
    }).catch(() => {
      this.$router.go(-1)
    })
  }
})
</script>
