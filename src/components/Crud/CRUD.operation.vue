<template>
  <div class="crud-opts">
    <span class="crud-opts-left">
      <!--左侧插槽-->
      <slot name="left" />
      <el-button
        v-if="crud.optShow.add"
        v-permission="permission.add"
        class="filter-item"

        type="primary"
        icon="IconPlus"
        @click="crud.toAdd"
      >
        新增
      </el-button>
      <el-button
        v-if="crud.optShow.edit"
        v-permission="permission.edit"
        class="filter-item"

        type="success"
        icon="IconEdit"
        :disabled="crud.selections.length !== 1"
        @click="crud.toEdit(crud.selections[0])"
      >
        修改
      </el-button>
      <el-button
        v-if="crud.optShow.del"
        v-permission="permission.del"
        class="filter-item"
        type="danger"
        icon="IconDelete"

        :loading="crud.delAllLoading"
        :disabled="crud.selections.length === 0"
        @click="toDelete(crud.selections)"
      >
        删除
      </el-button>
      <el-button
        v-if="crud.optShow.download"
        :loading="crud.downloadLoading"
        :disabled="!crud.data.length"
        class="filter-item"

        type="warning"
        icon="IconDownload"
        @click="crud.doExport"
      >导出</el-button>
      <!--右侧-->
      <slot name="right" />
    </span>
    <el-button-group class="crud-opts-right">
      <el-button

        plain
        type="info"
        icon="IconSearch"
        @click="toggleSearch()"
      />
      <el-button

        icon="IconRefresh"
        @click="crud.refresh()"
      />
      <el-popover
        placement="bottom-end"
        width="150"
        trigger="click"
      >
        <template #reference><el-button


          icon="IconGrid"
        >
          <i
            class="fa fa-caret-down"
            aria-hidden="true"
          />
        </el-button></template>
        <el-checkbox
          v-model="allColumnsSelected"
          :indeterminate="allColumnsSelectedIndeterminate"
          @change="handleCheckAllChange"
        >
          全选
        </el-checkbox>
        <el-checkbox
          v-for="item in tableColumns"
          :key="item.property"
          v-model="item.visible"
          @change="handleCheckedTableColumnsChange(item)"
        >
          {{ item.label }}
        </el-checkbox>
      </el-popover>
    </el-button-group>
  </div>
</template>
<script>
import CRUD, { crud } from '@crud/crud'

function sortWithRef(src, ref) {
  const result = Object.assign([], ref)
  let cursor = -1
  src.forEach(e => {
    const idx = result.indexOf(e)
    if (idx === -1) {
      cursor += 1
      result.splice(cursor, 0, e)
    } else {
      cursor = idx
    }
  })
  return result
}

export default {
  mixins: [crud()],
  props: {
    permission: {
      type: Object,
      default: () => { return {} }
    },
    hiddenColumns: {
      type: Array,
      default: () => { return [] }
    },
    ignoreColumns: {
      type: Array,
      default: () => { return [] }
    }
  },
  data() {
    return {
      tableColumns: [],
      columnConfigs: [],
      allColumnsSelected: true,
      allColumnsSelectedIndeterminate: false,
      tableUnwatcher: null,
      // 忽略下次表格列变动
      ignoreNextTableColumnsChange: false
    }
  },
  watch: {
    'crud.props.table'() {
      this.updateTableColumns()
      this.tableColumns.forEach(column => {
        if (this.hiddenColumns.indexOf(column.property) !== -1) {
          column.visible = false
          this.updateColumnVisible(column)
        }
      })
    },
    'crud.props.table.columns'() {
      this.updateTableColumns()
    }
  },
  created() {
    this.crud.updateProp('searchToggle', true)
  },
  methods: {
    updateTableColumns() {
      const table = this.crud.getTable()
      if (!table) {
        this.tableColumns = []
        return
      }
      let cols = null
      const columnFilter = e => e && e.type === 'default' && e.property && this.ignoreColumns.indexOf(e.property) === -1
      const refCols = table.columns.filter(columnFilter)
      if (this.ignoreNextTableColumnsChange) {
        this.ignoreNextTableColumnsChange = false
        return
      }
      this.ignoreNextTableColumnsChange = false
      const columns = []
      const fullTableColumns = [...this.columnConfigs, ...refCols].filter((column, index, all) => all.findIndex(item => item.property === column.property) === index)
      this.columnConfigs = fullTableColumns
      cols = sortWithRef(fullTableColumns, refCols)
      cols.forEach(config => {
        const column = {
          property: config.property,
          label: config.label,
          visible: this.crud.columnVisible(config.property)
        }
        columns.push(column)
      })
      this.tableColumns = columns
    },
    toDelete(datas) {
      this.$confirm(`确认删除选中的${datas.length}条数据?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.crud.delAllLoading = true
        this.crud.doDelete(datas)
      }).catch(() => {
      })
    },
    handleCheckAllChange(val) {
      if (val === false) {
        this.allColumnsSelected = true
        return
      }
      this.tableColumns.forEach(column => {
        if (!column.visible) {
          column.visible = true
          this.updateColumnVisible(column)
        }
      })
      this.allColumnsSelected = val
      this.allColumnsSelectedIndeterminate = false
    },
    handleCheckedTableColumnsChange(item) {
      let totalCount = 0
      let selectedCount = 0
      this.tableColumns.forEach(column => {
        ++totalCount
        selectedCount += column.visible ? 1 : 0
      })
      if (selectedCount === 0) {
        this.crud.notify('请至少选择一列', CRUD.NOTIFICATION_TYPE.WARNING)
        this.$nextTick(function() {
          item.visible = true
        })
        return
      }
      this.allColumnsSelected = selectedCount === totalCount
      this.allColumnsSelectedIndeterminate = selectedCount !== totalCount && selectedCount !== 0
      this.updateColumnVisible(item)
    },
    updateColumnVisible(item) {
      this.crud.updateProp('hiddenColumns', this.tableColumns.filter(column => !column.visible).map(column => column.property))
    },
    toggleSearch() {
      this.crud.props.searchToggle = !this.crud.props.searchToggle
    }
  }
}
</script>

<style>
  .crud-opts {
    padding: 4px 0;
    display: -webkit-flex;
    display: flex;
    align-items: center;
  }
  .crud-opts .crud-opts-right {
    margin-left: auto;
  }
  .crud-opts .crud-opts-right span {
    float: left;
  }
</style>
