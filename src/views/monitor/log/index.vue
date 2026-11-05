<template>
  <div class="app-container">
    <div class="head-container">
      <Search />
      <crudOperation>
        <template #left><el-button

          class="filter-item"
          type="danger"
          icon="IconDelete"

          :loading="crud.delAllLoading"
          @click="confirmDelAll()"
        >
          清空
        </el-button></template>
      </crudOperation>
    </div>
    <!--表格渲染-->
    <el-table @expand-change="crud.expandChange" ref="table" v-loading="crud.loading" :data="crud.data" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
      <el-table-column type="expand">
        <template #default="props">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item label="请求方法">
              <span>{{ props.row.method }}</span>
            </el-form-item>
            <el-form-item label="请求参数">
              <span>{{ props.row.params }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column v-if="crud.columnVisible('username')" prop="username" label="用户名" />
      <el-table-column v-if="crud.columnVisible('requestIp')" prop="requestIp" label="IP" />
      <el-table-column v-if="crud.columnVisible('address')" :show-overflow-tooltip="true" prop="address" label="IP来源" />
      <el-table-column v-if="crud.columnVisible('description')" prop="description" label="描述" />
      <el-table-column v-if="crud.columnVisible('browser')" prop="browser" label="浏览器" />
      <el-table-column v-if="crud.columnVisible('time')" prop="time" label="请求耗时" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.time <= 300">{{ scope.row.time }}ms</el-tag>
          <el-tag v-else-if="scope.row.time <= 1000" type="warning">{{ scope.row.time }}ms</el-tag>
          <el-tag v-else type="danger">{{ scope.row.time }}ms</el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="crud.columnVisible('createTime')" prop="createTime" label="创建日期" width="180px" />
    </el-table>
    <!--分页组件-->
    <pagination />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Search from './search.vue'
import { delAllInfo } from '@/api/monitor/log'
import CRUD, { crudBindings } from '@crud/crud'
import type { AuditLog } from '@/types/business'
const { presenter } = crudBindings<AuditLog>()
import crudOperation from '@crud/CRUD.operation.vue'
import pagination from '@crud/Pagination.vue'

export default defineComponent({
  name: 'Log',
  components: { Search, crudOperation, pagination },
  cruds() {
    return CRUD<AuditLog>({ title: '日志', url: 'api/logs' })
  },
  mixins: [presenter()],
  created() {
    this.crud.optShow = {
      add: false,
      edit: false,
      del: false,
      download: true
    }
  },
  methods: {
    confirmDelAll() {
      this.$confirm(`确认清空所有操作日志吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.crud.delAllLoading = true
        delAllInfo().then(res => {
          this.crud.delAllLoading = false
          this.crud.dleChangePage(1)
          this.crud.delSuccessNotify()
          this.crud.toQuery()
        }).catch(err => {
          this.crud.delAllLoading = false
          console.log(err.response.data.message)
        })
      }).catch(() => {
      })
    }
  }
})
</script>

<style>
.demo-table-expand {
  font-size: 0;
}
.demo-table-expand label {
  width: 70px;
  color: #99a9bf;
}
.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 100%;
}
.demo-table-expand .el-form-item__content {
  font-size: 12px;
}
</style>
