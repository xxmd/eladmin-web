<template>
  <div class="app-container">
    <div class="head-container">
      <div v-show="showSearch">
        <el-input v-model="query.name" clearable placeholder="输入岗位名称搜索" class="filter-item" style="width: 200px" @keyup.enter="run(search)" />
        <DateRangePicker v-model="query.createTime" class="date-item" />
        <el-select v-model="query.enabled" clearable placeholder="状态" class="filter-item" style="width: 100px" @change="run(search)">
          <el-option v-for="item in statusOptions" :key="item.id" :label="item.label" :value="item.value" />
        </el-select>
        <el-button type="success" icon="IconSearch" @click="run(search)">搜索</el-button>
        <el-button type="warning" icon="IconRefreshLeft" @click="run(reset)">重置</el-button>
      </div>
      <div class="crud-opts">
        <el-button v-permission="['admin', 'job:add']" type="primary" icon="IconPlus" @click="openAdd">新增</el-button>
        <el-button v-permission="['admin', 'job:edit']" type="success" icon="IconEdit" :disabled="selection.length !== 1" @click="selection[0] && openEdit(selection[0])">修改</el-button>
        <el-button v-permission="['admin', 'job:del']" type="danger" icon="IconDelete" :disabled="!selection.length" @click="removeJobs(selection)">删除</el-button>
        <el-button type="warning" icon="IconDownload" :loading="exporting" :disabled="!rows.length" @click="exportJobs">导出</el-button>
        <el-button-group style="margin-left: auto">
          <el-button icon="IconSearch" aria-label="切换搜索" @click="showSearch = !showSearch" />
          <el-button icon="IconRefresh" aria-label="刷新" @click="run(refresh)" />
          <el-popover trigger="click" width="160">
            <template #reference><el-button icon="IconGrid" aria-label="选择列" /></template>
            <el-checkbox v-for="column in columns" :key="column.prop" v-model="column.visible" :disabled="column.visible && visibleCount === 1">{{ column.label }}</el-checkbox>
          </el-popover>
        </el-button-group>
      </div>
    </div>
    <el-table v-loading="loading" :data="rows" row-key="id" @selection-change="selection = $event">
      <el-table-column type="selection" width="55" />
      <template v-for="column in columns" :key="column.prop">
        <el-table-column v-if="column.visible" :prop="column.prop" :label="column.label" :align="column.prop === 'enabled' ? 'center' : 'left'">
          <template #default="scope">
            <el-switch v-if="column.prop === 'enabled'" :model-value="scope.row.enabled" :disabled="!canEdit" @change="changeEnabled(scope.row)" />
            <span v-else>{{ scope.row[column.prop] }}</span>
          </template>
        </el-table-column>
      </template>
      <el-table-column v-if="canEdit || canDelete" label="操作" align="center" fixed="right">
        <template #default="scope">
          <el-button v-if="canEdit" type="primary" icon="IconEdit" aria-label="编辑岗位" @click="openEdit(scope.row)" />
          <el-button v-if="canDelete" type="danger" icon="IconDelete" aria-label="删除岗位" @click="removeJobs([scope.row])" />
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-model:current-page="page.current" v-model:page-size="page.size" :total="page.total" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next" style="margin-top: 16px" @current-change="run(refresh)" @size-change="run(search)" />
    <el-dialog v-model="dialog" :title="mode === 'add' ? '新增岗位' : '编辑岗位'" width="500px" append-to-body :close-on-click-modal="false" :close-on-press-escape="!saving" :show-close="!saving">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="排序" prop="jobSort"><el-input-number v-model="form.jobSort" :min="0" :max="999" /></el-form-item>
        <el-form-item label="状态" prop="enabled">
          <el-radio-group v-model="form.enabled"><el-radio v-for="item in statusOptions" :key="item.id" :value="item.value === 'true'">{{ item.label }}</el-radio></el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button :disabled="saving" @click="dialog = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import * as api from '@/api/system/job'
import request from '@/utils/request'
import { downloadFile } from '@/utils/index'
import { useCrud } from '@/composables/useCrud'
import { useDict } from '@/composables/useDict'
import DateRangePicker from '@/components/DateRangePicker/index.vue'
import type { Job, JobForm, JobQuery } from '@/types/api'
defineOptions({ name: 'Job' })
const store = useStore()
const roles = computed<string[]>(() => store.getters.roles)
const canEdit = computed(() => roles.value.some(role => ['admin', 'job:edit'].includes(role)))
const canDelete = computed(() => roles.value.some(role => ['admin', 'job:del'].includes(role)))
const { entries: statusOptions } = useDict('job_status')
const { rows, selection, form, query, page, loading, saving, dialog, mode, params, refresh, search, reset, add, edit, save, remove } = useCrud<Job, JobForm, JobQuery>({
  api, defaultForm: () => ({ id: null, name: '', jobSort: 999, enabled: true }),
  toForm: row => ({ id: row.id, name: row.name, jobSort: row.jobSort, enabled: row.enabled }),
  defaultQuery: () => ({ name: '', enabled: '', createTime: [] }), sort: ['jobSort,asc', 'id,desc']
})
const formRef = ref<FormInstance>()
const rules: FormRules<JobForm> = { name: [{ required: true, message: '请输入名称', trigger: 'blur' }], jobSort: [{ required: true, type: 'number', message: '请输入序号', trigger: 'blur' }] }
const showSearch = ref(true)
const exporting = ref(false)
const columns = reactive([{ prop: 'name', label: '名称', visible: true }, { prop: 'jobSort', label: '排序', visible: true }, { prop: 'enabled', label: '状态', visible: true }, { prop: 'createTime', label: '创建日期', visible: true }])
const visibleCount = computed(() => columns.filter(column => column.visible).length)
async function run(action: () => Promise<unknown>) { try { await action() } catch { /* request layer displays API errors */ } }
async function openAdd() { add(); await nextTick(); formRef.value?.clearValidate() }
async function openEdit(row: Job) { edit(row); await nextTick(); formRef.value?.clearValidate() }
async function submit() {
  if (!await formRef.value?.validate().catch(() => false)) return
  await run(async () => { await save(); ElMessage.success('保存成功') })
}
async function removeJobs(items: Job[]) {
  try { await ElMessageBox.confirm(`确认删除选中的${items.length}条数据？`, '提示', { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }) } catch { return }
  await run(async () => { await remove(items); ElMessage.success('删除成功') })
}
async function changeEnabled(row: Job) {
  try { await ElMessageBox.confirm(`确定${row.enabled ? '停用' : '启用'}「${row.name}」岗位？`, '提示', { confirmButtonText: '确定', cancelButtonText: '取消' }) } catch { return }
  await run(async () => { await api.edit({ ...row, enabled: !row.enabled }); await refresh(); ElMessage.success('修改成功') })
}
async function exportJobs() {
  exporting.value = true
  try { const blob = await request<Blob>({ url: 'api/job/download', params: params.value, responseType: 'blob' }); downloadFile(blob, '岗位数据', 'xlsx') } catch { /* request layer displays API errors */ } finally { exporting.value = false }
}
onMounted(() => { void run(refresh) })
</script>

<style scoped>
.crud-opts { display: flex; align-items: center; gap: 4px; }
</style>
