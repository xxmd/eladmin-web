<!--搜索与重置-->
<template>
  <span>
    <el-button class="filter-item" type="success" icon="IconSearch" @click="crud.toQuery">搜索</el-button>
    <el-button v-if="crud.optShow.reset" class="filter-item" type="warning" icon="IconRefreshLeft" @click="crud.resetQuery()">重置</el-button>
  </span>
</template>
<script>
import { crud } from '@crud/crud'
export default {
  mixins: [crud()],
  props: {
    itemClass: {
      type: String,
      required: false,
      default: ''
    }
  }
}
</script>
