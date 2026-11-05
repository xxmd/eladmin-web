<template>
  <div
    v-if="crud.props.searchToggle"
  >
    <el-input v-model="query.name" clearable placeholder="输入岗位名称搜索" style="width: 200px;" class="filter-item" @keyup.enter="crud.toQuery" />
    <date-range-picker v-model="query.createTime" class="date-item" />
    <el-select v-model="query.enabled" clearable placeholder="状态" class="filter-item" style="width: 90px" @change="crud.toQuery">
      <el-option v-for="item in dict.dict.job_status" :key="item.value" :label="item.label" :value="item.value" />
    </el-select>
    <rrOperation />
  </div>
</template>

<script>
import { header } from '@crud/crud'
import rrOperation from '@crud/RR.operation.vue'
import DateRangePicker from '@/components/DateRangePicker/index.vue'
export default {
  components: { rrOperation, DateRangePicker },
  mixins: [header()],
  props: {
    dict: {
      type: Object,
      required: true
    },
    permission: {
      type: Object,
      required: true
    }
  }
}
</script>
