<template>
  <div class="app-container" style="padding: 8px;">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.blurry" clearable placeholder="输入内容模糊搜索" style="width: 200px;" class="filter-item" @keyup.enter="crud.toQuery" />
        <date-range-picker v-model="query.createTime" class="date-item" />
        <rrOperation />
      </div>
      <crudOperation :permission="permission">
        <!-- 新增 -->
        <template #left><el-button

          v-permission="['admin','storage:add']"
          class="filter-item"

          type="primary"
          icon="IconUpload"
          @click="crud.toAdd"
        >上传
        </el-button></template>
      </crudOperation>
    </div>
    <!--表单组件-->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :model-value="crud.status.cu > 0" :title="crud.status.add ? '文件上传' : '编辑文件'" width="500px">
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="文件名">
          <el-input v-model="form.name" style="width: 370px;" />
        </el-form-item>
        <!--   上传文件   -->
        <el-form-item v-if="crud.status.add" label="上传">
          <el-upload
            ref="upload"
            :limit="1"
            :before-upload="beforeUpload"
            :auto-upload="false"
            :headers="headers"
            :on-success="handleSuccess"
            :on-error="handleError"
            :action="fileUploadApi + '?name=' + form.name"
          >
            <div class="eladmin-upload"><IconUpload class="legacy-icon " /> 添加文件</div>
            <template #tip><div  class="el-upload__tip">可上传任意格式文件，且不超过100M</div></template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer><div  class="dialog-footer">
        <el-button type="primary" link @click="crud.cancelCU">取消</el-button>
        <el-button v-if="crud.status.add" :loading="loading" type="primary" @click="upload">确认</el-button>
        <el-button v-else :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
      </div></template>
    </el-dialog>
    <!--表格渲染-->
    <el-table @expand-change="crud.expandChange" ref="table" v-loading="crud.loading" :data="crud.data" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
      <el-table-column type="selection" width="55" />
      <el-table-column v-if="crud.columnVisible('name')" prop="name" label="文件名">
        <template #default="scope">
          <el-popover
            :content="'file/' + scope.row.type + '/' + scope.row.realName"
            placement="top-start"
            title="路径"
            width="200"
            trigger="hover"
          >
            <template #reference><a

              :href="baseApi + '/file/' + scope.row.type + '/' + scope.row.realName"
              class="el-link--primary"
              style="word-break:keep-all;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color: #1890ff;font-size: 13px;"
              target="_blank"
            >
              {{ scope.row.name }}
            </a></template>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column v-if="crud.columnVisible('path')" prop="path" label="预览图">
        <template #default="{row}">
          <el-image
            :src=" baseApi + '/file/' + row.type + '/' + row.realName"
            :preview-src-list="[baseApi + '/file/' + row.type + '/' + row.realName]"
            fit="contain"
            lazy
            class="el-avatar"
          >
            <template #error><div >
              <IconDocument class="legacy-icon " />
            </div></template>
          </el-image>
        </template>
      </el-table-column>
      <el-table-column v-if="crud.columnVisible('suffix')" prop="suffix" label="文件类型" />
      <el-table-column v-if="crud.columnVisible('type')" prop="type" label="类别" />
      <el-table-column v-if="crud.columnVisible('size')" prop="size" label="大小" />
      <el-table-column v-if="crud.columnVisible('operate')" prop="operate" label="操作人" />
      <el-table-column v-if="crud.columnVisible('createTime')" prop="createTime" label="创建日期" />
    </el-table>
    <!--分页组件-->
    <pagination />
  </div>
</template>

<script lang="ts">
import type { UploadFile, UploadRawFile, UploadInstance } from 'element-plus'
import type { EntityId } from '@/types/api'
import { defineComponent } from 'vue'
import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth'
import crudFile from '@/api/tools/localStorage'
import CRUD, { crudBindings } from '@crud/crud'
import type { LocalFile, LocalFileForm } from '@/types/business'
const { presenter, header, form, crud } = crudBindings<LocalFile, LocalFileForm>()
import rrOperation from '@crud/RR.operation.vue'
import crudOperation from '@crud/CRUD.operation.vue'
import pagination from '@crud/Pagination.vue'
import DateRangePicker from '@/components/DateRangePicker/index.vue'

const defaultForm: LocalFileForm = { id: null, name: '' }
export default defineComponent({
  components: { pagination, crudOperation, rrOperation, DateRangePicker },
  cruds() {
    return CRUD<LocalFile, LocalFileForm>({ title: '文件', url: 'api/localStorage', crudMethod: { edit: crudFile.edit, del: crudFile.del }})
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  data() {
    return {
      delAllLoading: false,
      loading: false,
      headers: { 'Authorization': getToken() },
      permission: {
        edit: ['admin', 'storage:edit'],
        del: ['admin', 'storage:del']
      }
    }
  },
  computed: {
    ...mapGetters([
      'baseApi',
      'fileUploadApi'
    ])
  },
  created() {
    this.crud.optShow.add = false
  },
  methods: {
    // 上传文件
    upload() {
      ;(this.$refs.upload as UploadInstance).submit()
    },
    beforeUpload(file: UploadRawFile) {
      let isLt2M = true
      isLt2M = file.size / 1024 / 1024 < 100
      if (!isLt2M) {
        this.loading = false
        this.$message.error('上传文件大小不能超过 100MB!')
      }
      this.form.name = file.name
      return isLt2M
    },
    handleSuccess(response: { id: EntityId }, file: UploadFile) {
      this.crud.notify('上传成功', CRUD.NOTIFICATION_TYPE.SUCCESS)
      ;(this.$refs.upload as UploadInstance).clearFiles()
      this.crud.status.add = CRUD.STATUS.NORMAL
      this.crud.resetForm()
      this.crud.toQuery()
    },
    // 监听上传失败
    handleError(e: Error) {
      const msg = JSON.parse(e.message)
      this.$notify({
        title: msg.message,
        type: 'error',
        duration: 2500
      })
      this.loading = false
    }
  }
})
</script>

<style scoped>
 :deep(.el-image__error, .el-image__placeholder) {
    background: none;
  }
 :deep(.el-image-viewer__wrapper) {
    top: 55px;
  }
</style>
