<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <el-input v-model="query.name" clearable placeholder="请输入表名" style="width: 200px;" class="filter-item" @keyup.enter="crud.toQuery" />
        <rrOperation />
      </div>
      <crudOperation>
        <template #right><el-tooltip  class="item" effect="dark" content="数据库中表字段变动时使用该功能" placement="top-start">
          <el-button
            class="filter-item"

            type="success"
            icon="IconRefresh"
            :loading="syncLoading"
            :disabled="crud.selections.length === 0"
            @click="sync"
          >同步</el-button>
        </el-tooltip></template>
      </crudOperation>
    </div>
    <!--表格渲染-->
    <el-table @expand-change="crud.expandChange" ref="table" v-loading="crud.loading" :data="crud.data" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
      <el-table-column type="selection" width="55" />
      <el-table-column v-if="crud.columnVisible('tableName')" :show-overflow-tooltip="true" prop="tableName" label="表名" />
      <el-table-column v-if="crud.columnVisible('engine')" :show-overflow-tooltip="true" prop="engine" label="数据库引擎" />
      <el-table-column v-if="crud.columnVisible('coding')" :show-overflow-tooltip="true" prop="coding" label="字符编码集" />
      <el-table-column v-if="crud.columnVisible('remark')" :show-overflow-tooltip="true" prop="remark" label="备注" />
      <el-table-column v-if="crud.columnVisible('createTime')" prop="createTime" label="创建日期" />
      <el-table-column label="操作" width="160px" align="center" fixed="right">
        <template #default="scope">
          <el-button style="margin-right: 2px" type="primary" link>
            <router-link :to="'/sys-tools/generator/preview/' + scope.row.tableName">
              预览
            </router-link>
          </el-button>
          <el-button style="margin-left: -1px;margin-right: 2px" type="primary" link @click="toDownload(scope.row.tableName)">下载</el-button>
          <el-button style="margin-left: -1px;margin-right: 2px" type="primary" link>
            <router-link :to="'/sys-tools/generator/config/' + scope.row.tableName">
              配置
            </router-link>
          </el-button>
          <el-button type="primary" link style="margin-left: -1px" @click="toGen(scope.row.tableName)">生成</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <pagination />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { generator, sync } from '@/api/generator/generator'
import { downloadFile } from '@/utils/index'
import CRUD, { crudBindings } from '@crud/crud'
import type { GeneratorTable } from '@/types/business'
const { presenter, header } = crudBindings<GeneratorTable>()
import rrOperation from '@crud/RR.operation.vue'
import crudOperation from '@crud/CRUD.operation.vue'
import pagination from '@crud/Pagination.vue'

export default defineComponent({
  name: 'GeneratorIndex',
  components: { pagination, crudOperation, rrOperation },
  cruds() {
    return CRUD<GeneratorTable>({ url: 'api/generator/tables', idField: 'tableName' })
  },
  mixins: [presenter(), header()],
  data() {
    return {
      syncLoading: false
    }
  },
  created() {
    this.crud.optShow = { add: false, edit: false, del: false, download: false, reset: false }
  },
  methods: {
    toGen(tableName: string) {
      // 生成代码
      generator(tableName, 0).then(data => {
        this.$notify({
          title: '生成成功',
          type: 'success',
          duration: 2500
        })
      })
    },
    toDownload(tableName: string) {
      // 打包下载
      generator(tableName, 2).then(data => {
        downloadFile(data, tableName, 'zip')
      })
    },
    sync() {
      const tables: string[] = []
      this.crud.selections.forEach(val => {
        tables.push(val.tableName)
      })
      this.syncLoading = true
      sync(tables).then(() => {
        this.crud.refresh()
        this.crud.notify('同步成功', CRUD.NOTIFICATION_TYPE.SUCCESS)
        this.syncLoading = false
      }).then(() => {
        this.syncLoading = false
      })
    }
  }
})
</script>

<style scoped>

</style>
