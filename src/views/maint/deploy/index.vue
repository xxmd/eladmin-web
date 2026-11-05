<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.appName" clearable placeholder="输入应用名称查询" style="width: 200px" class="filter-item" @keyup.enter="crud.toQuery" />
        <date-range-picker v-model="query.createTime" class="date-item" />
        <rrOperation />
      </div>
      <crudOperation :permission="permission">
        <template #right>
          <el-button
            v-permission="['admin','deploy:add']"
            :disabled="!selectIndex"
            class="filter-item"

            type="primary"
            icon="IconUpload"
            @click="sysRestore"
          >系统还原
          </el-button>
          <el-button
            v-permission="['admin','deploy:add']"
            :disabled="!selectIndex"
            class="filter-item"

            type="primary"
            icon="IconUpload"
            @click="serverStatus"
          >状态查询
          </el-button>
          <el-button
            v-permission="['admin','deploy:add']"
            :disabled="!selectIndex"
            class="filter-item"

            type="success"
            icon="IconUpload"
            @click="startServer"
          >启动
          </el-button>
          <el-button
            v-permission="['admin','deploy:add']"
            :disabled="!selectIndex"
            class="filter-item"

            type="danger"
            icon="IconUpload"
            @click="stopServer"
          >停止
          </el-button>
          <el-button
            v-permission="['admin','deploy:add']"
            :disabled="!selectIndex"
            class="filter-item"

            type="warning"
            icon="IconUpload"
            @click="deploy"
          >一键部署
          </el-button>
        </template>
      </crudOperation>
    </div>
    <!--表单组件-->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :model-value="crud.status.cu > 0" :title="crud.status.title" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="应用" prop="app.id">
          <el-select v-model.number="form.app.id" placeholder="请选择" style="width: 370px">
            <el-option v-for="item in apps" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="服务器" prop="deploys">
          <el-select v-model="selectedServers" multiple placeholder="请选择" style="width: 370px">
            <el-option v-for="item in servers" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer><div  class="dialog-footer">
        <el-button type="primary" link @click="crud.cancelCU">取消</el-button>
        <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
      </div></template>
    </el-dialog>
    <!--统还原组件-->
    <fForm ref="sysRestore" :key="times" :app-name="appName" :deploy-id="deployId" @restored="crud.toQuery()" />
    <dForm ref="deploy" />
    <!--表格渲染-->
    <el-table @expand-change="crud.expandChange" ref="table" v-loading="crud.loading" :data="crud.data" highlight-current-row stripe style="width: 100%" @selection-change="handleCurrentChange">
      <el-table-column type="selection" width="55" />
      <el-table-column v-if="crud.columnVisible('app.name')" prop="app.name" label="应用名称" />
      <el-table-column v-if="crud.columnVisible('servers')" prop="servers" label="服务器列表" />
      <el-table-column v-if="crud.columnVisible('createTime')" prop="createTime" label="部署日期" />
      <el-table-column v-if="checkPer(['admin','deploy:edit','deploy:del'])" label="操作" width="150px" align="center">
        <template #default="scope">
          <udOperation
            :data="scope.row"
            :permission="permission"
          />
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <pagination />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import crudDeploy from '@/api/maint/deploy'
import dForm from './deploy.vue'
import fForm from './sysRestore.vue'
import CRUD, { crudBindings, type CrudController } from '@crud/crud'
import type { Deployment, DeploymentForm, DeploymentApp, DeploymentServer } from '@/types/business'
const { presenter, header, form, crud } = crudBindings<Deployment, DeploymentForm>()
import type { EntityId } from '@/types/api'
type PageCrud = CrudController<Deployment, DeploymentForm>
import rrOperation from '@crud/RR.operation.vue'
import crudOperation from '@crud/CRUD.operation.vue'
import udOperation from '@crud/UD.operation.vue'
import pagination from '@crud/Pagination.vue'
import DateRangePicker from '@/components/DateRangePicker/index.vue'

const defaultForm: DeploymentForm = { id: null, app: { id: null }, deploys: [] }
export default defineComponent({
  name: 'Deploy',
  components: { dForm, fForm, pagination, crudOperation, rrOperation, udOperation, DateRangePicker },
  cruds() {
    return CRUD<Deployment, DeploymentForm>({ title: '部署', url: 'api/deploy', crudMethod: { ...crudDeploy }})
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  data() {
    return {
      currentRow: null as Deployment | null, selectedServers: [] as EntityId[], selectIndex: '' as EntityId, appName: '', urlHistory: '',
      times: 0, appId: '' as EntityId, deployId: '' as EntityId, apps: [] as DeploymentApp[], servers: [] as DeploymentServer[],
      permission: {
        add: ['admin', 'deploy:add'],
        edit: ['admin', 'deploy:edit'],
        del: ['admin', 'deploy:del']
      },
      rules: {
        'app.id': [
          { required: true, message: '应用不能为空', trigger: 'blur', type: 'number' }
        ],
        deploys: [
          { required: true, message: '服务器不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    [CRUD.HOOK.beforeRefresh]() {
      this.selectIndex = ''
      return true
    },
    // 新增编辑前做的操作
    [CRUD.HOOK.beforeToCU](crud: PageCrud, form: DeploymentForm) {
      this.initSelect()
      this.selectedServers = form.deploys.map(deploy => deploy.id)
    },
    // 提交前
    [CRUD.HOOK.beforeSubmit]() {
      this.form.deploys = this.selectedServers.map(id => ({ id }))
      return true
    },
    deploy() {
      if (!this.currentRow) return
      ;(this.$refs.deploy as InstanceType<typeof dForm>).dialog = true
      ;(this.$refs.deploy as InstanceType<typeof dForm>).deployInfo = this.currentRow
    },
    sysRestore() {
      ;(this.$refs.sysRestore as InstanceType<typeof fForm>).dialog = true
    },
    handleCurrentChange(selection: Deployment[]) {
      this.crud.selections = selection
      if (selection.length === 1) {
        const row = selection[0]
        this.selectIndex = row.id
        this.currentRow = row
        this.appName = row.app.name
        this.times = this.times + 1
        this.appId = row.app.id
        this.deployId = row.id
      } else {
        this.currentRow = null
        this.selectIndex = ''
      }
    },
    startServer() {
      if (!this.currentRow) return
      crudDeploy.startServer(this.currentRow)
        .then(res => {
        })
        .catch(err => {
          console.log('error:' + err.response.data.message)
        })
    },
    stopServer() {
      if (!this.currentRow) return
      crudDeploy.stopServer(this.currentRow)
        .then(res => {
        })
        .catch(err => {
          console.log('error:' + err.response.data.message)
        })
    },
    serverStatus() {
      if (!this.currentRow) return
      crudDeploy.serverStatus(this.currentRow)
        .then(res => {
        })
        .catch(err => {
          console.log('error:' + err.response.data.message)
        })
    },
    initSelect() {
      crudDeploy.getApps().then(res => {
        this.apps = res.content
      })
      crudDeploy.getServers().then(res => {
        this.servers = res.content
      })
    }
  }
})
</script>

<style scoped>
</style>
