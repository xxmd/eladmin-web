<template>
  <div class="crud-row-actions">
    <el-button v-permission="permission.edit" :loading="crud.status.cu === 2" :disabled="disabledEdit" type="primary" class="classic-edit-button" icon="IconEdit" @click.stop="crud.toEdit(data)" />
    <el-popover v-model:visible="pop" v-if="!permission.del || checkPer(permission.del)" placement="top" width="180" :show-arrow="true" @show="onPopoverShow" @hide="onPopoverHide">
      <p>{{ msg }}</p>
      <div style="text-align: right; margin: 0">
        <el-button type="primary" link @click="doCancel">取消</el-button>
        <el-button :loading="crud.getDataStatus(crud.getDataId(data)).delete === 2" type="primary" @click="crud.doDelete(data)">确定</el-button>
      </div>
      <template #reference><el-button  :disabled="disabledDle" type="danger" icon="IconDelete" @click.stop="toDelete" /></template>
    </el-popover>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import CRUD, { crud, type CrudController } from '@crud/crud'
export default defineComponent({
  mixins: [crud()],
  props: {
    data: {
      type: Object,
      required: true
    },
    permission: {
      type: Object,
      required: true
    },
    disabledEdit: {
      type: Boolean,
      default: false
    },
    disabledDle: {
      type: Boolean,
      default: false
    },
    msg: {
      type: String,
      default: '确定删除本条数据吗？'
    }
  },
  data() {
    return {
      pop: false
    }
  },
  methods: {
    doCancel() {
      this.pop = false
      this.crud.cancelDelete(this.data)
    },
    toDelete() {
      this.pop = true
    },
    [CRUD.HOOK.afterDelete](crud: CrudController, data: object) {
      if (data === this.data) {
        this.pop = false
      }
    },
    onPopoverShow() {
      setTimeout(() => {
        document.addEventListener('click', this.handleDocumentClick)
      }, 0)
    },
    onPopoverHide() {
      document.removeEventListener('click', this.handleDocumentClick)
    },
    handleDocumentClick() {
      this.pop = false
    }
  }
})
</script>
<style scoped>
.crud-row-actions {
  display: inline-flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: center;
  gap: 4px;
  white-space: nowrap;
}
.crud-row-actions > :deep(.el-button) {
  flex: 0 0 auto;
  margin-left: 0;
}
</style>
