<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--侧边部门数据-->
      <el-col :xs="9" :sm="6" :md="5" :lg="4" :xl="4">
        <div class="head-container">
          <el-input
            v-model="deptName"
            clearable

            placeholder="输入部门名称搜索"
            prefix-icon="IconSearch"
            class="filter-item"
            @input="getDeptDatas"
          />
        </div>
        <el-tree
          :data="deptDatas"
          :load="getDeptDatas"
          :props="defaultProps"
          :expand-on-click-node="false"
          lazy
          @node-click="handleNodeClick"
        />
      </el-col>
      <!--用户数据-->
      <el-col :xs="15" :sm="18" :md="19" :lg="20" :xl="20">
        <!--工具栏-->
        <div class="head-container">
          <div v-if="crud.props.searchToggle">
            <!-- 搜索 -->
            <el-input
              v-model="query.blurry"
              clearable

              placeholder="输入名称或者邮箱搜索"
              style="width: 200px;"
              class="filter-item"
              @keyup.enter="crud.toQuery"
            />
            <date-range-picker v-model="query.createTime" class="date-item" />
            <el-select
              v-model="query.enabled"
              clearable

              placeholder="状态"
              class="filter-item"
              style="width: 90px"
              @change="crud.toQuery"
            >
              <el-option
                v-for="item in enabledTypeOptions"
                :key="item.key"
                :label="item.display_name"
                :value="item.key"
              />
            </el-select>
            <rrOperation />
          </div>
          <crudOperation show="" :permission="permission">
            <template #right><el-button

              v-permission="['admin','user:add']"
              :disabled="crud.selections.length === 0"
              class="filter-item"

              type="primary"
              icon="IconRefreshLeft"
              @click="resetPwd(crud.selections)"
            >重置密码
            </el-button></template>
          </crudOperation>
        </div>
        <!--表单渲染-->
        <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :model-value="crud.status.cu > 0" :title="crud.status.title" width="555px">
          <el-form ref="form" class="user-form" :inline="true" :model="form" :rules="rules" label-width="66px">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" @keydown="keydown($event)" />
            </el-form-item>
            <el-form-item label="电话" prop="phone">
              <el-input v-model.number="form.phone" />
            </el-form-item>
            <el-form-item label="昵称" prop="nickName">
              <el-input v-model="form.nickName" @keydown="keydown($event)" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" />
            </el-form-item>
            <el-form-item label="部门" prop="dept.id">
              <el-tree-select
                v-model="form.dept.id"
                :data="depts"
                :load="loadDepts"
                :props="defaultProps"
                node-key="id"
                lazy
                check-strictly
                clearable
                :render-after-expand="false"
                style="width: 173px"
                placeholder="选择部门"
              />
            </el-form-item>
            <el-form-item label="岗位" prop="jobDatas" class="is-required">
              <el-select
                v-model="jobDatas"
                style="width: 172px"
                multiple
                placeholder="请选择"
                @remove-tag="deleteTag"
                @change="changeJob"
              >
                <el-option
                  v-for="item in jobs"
                  :key="item.name"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="性别">
              <el-radio-group v-model="form.gender" style="width: 178px">
                <el-radio value="男">男</el-radio>
                <el-radio value="女">女</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="状态">
              <el-radio-group v-model="form.enabled" :disabled="form.id === user.id">
                <el-radio
                  v-for="item in dict.user_status"
                  :key="item.id"
                  :value="item.value"
                >{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item style="margin-bottom: 0;" label="角色" prop="roleDatas" class="is-required">
              <el-select
                v-model="roleDatas"
                :disabled="form.id === user.id"
                style="width: 426px"
                multiple
                placeholder="请选择"
                @remove-tag="deleteTag"
                @change="changeRole"
              >
                <el-option
                  v-for="item in roles"
                  :key="item.name"
                  :disabled="level !== 1 && item.level <= level"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-form>
          <template #footer><div  class="dialog-footer">
            <el-button type="primary" link @click="crud.cancelCU">取消</el-button>
            <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
          </div></template>
        </el-dialog>
        <!--表格渲染-->
        <el-table @expand-change="crud.expandChange" ref="table" v-loading="crud.loading" :data="crud.data" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
          <el-table-column :selectable="checkboxT" type="selection" width="55" />
          <el-table-column v-if="crud.columnVisible('username')" :show-overflow-tooltip="true" prop="username" label="用户名" />
          <el-table-column v-if="crud.columnVisible('nickName')" :show-overflow-tooltip="true" prop="nickName" label="昵称" />
          <el-table-column v-if="crud.columnVisible('gender')" prop="gender" label="性别" />
          <el-table-column v-if="crud.columnVisible('phone')" :show-overflow-tooltip="true" prop="phone" width="100" label="电话" />
          <el-table-column v-if="crud.columnVisible('email')" :show-overflow-tooltip="true" width="135" prop="email" label="邮箱" />
          <el-table-column v-if="crud.columnVisible('dept')" :show-overflow-tooltip="true" prop="dept" label="部门">
            <template #default="scope">
              <div>{{ scope.row.dept.name }}</div>
            </template>
          </el-table-column>
          <el-table-column v-if="crud.columnVisible('enabled')" label="状态" align="center" prop="enabled">
            <template #default="scope">
              <el-switch
                v-model="scope.row.enabled"
                :disabled="user.id === scope.row.id"
                active-color="#409EFF"
                inactive-color="#F56C6C"
                @change="changeEnabled(scope.row, scope.row.enabled)"
              />
            </template>
          </el-table-column>
          <el-table-column v-if="crud.columnVisible('createTime')" :show-overflow-tooltip="true" prop="createTime" width="135" label="创建日期" />
          <el-table-column
            v-if="checkPer(['admin','user:edit','user:del'])"
            label="操作"
            width="115"
            align="center"
            fixed="right"
          >
            <template #default="scope">
              <udOperation
                :data="scope.row"
                :permission="permission"
                :disabled-dle="scope.row.id === user.id"
              />
            </template>
          </el-table-column>
        </el-table>
        <!--分页组件-->
        <pagination />
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import crudUser from '@/api/system/user'
import { isvalidPhone } from '@/utils/validate'
import { getDepts, getDeptSuperior } from '@/api/system/dept'
import { getAll, getLevel } from '@/api/system/role'
import { getAllJob } from '@/api/system/job'
import CRUD, { crudBindings, type CrudController } from '@crud/crud'
import type { Department, DepartmentQuery, Role, LazyNode, EntityRef, UserRecord, UserForm } from '@/types/business'
const { presenter, header, form, crud } = crudBindings<UserRecord, UserForm>()
import type { EntityId, Job } from '@/types/api'
type PageCrud = CrudController<UserRecord, UserForm>
import rrOperation from '@crud/RR.operation.vue'
import crudOperation from '@crud/CRUD.operation.vue'
import udOperation from '@crud/UD.operation.vue'
import pagination from '@crud/Pagination.vue'
import DateRangePicker from '@/components/DateRangePicker/index.vue'

import { mapGetters } from 'vuex'


let userRoles: EntityRef[] = []
let userJobs: EntityRef[] = []
const defaultForm: UserForm = { id: null, username: '', nickName: '', gender: '男', email: '', enabled: 'false', roles: [] as Role[], jobs: [] as Job[], dept: { id: null }, phone: '' }
export default defineComponent({
  name: 'User',
  components: { crudOperation, rrOperation, udOperation, pagination, DateRangePicker },
  cruds() {
    return CRUD<UserRecord, UserForm>({ title: '用户', url: 'api/users', crudMethod: { ...crudUser }})
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  // 数据字典
  dicts: ['user_status'],
  data() {
    // 自定义验证
    const validPhone = (rule: unknown, value: string, callback: (error?: Error) => void) => {
      if (!value) {
        callback(new Error('请输入电话号码'))
      } else if (!isvalidPhone(value)) {
        callback(new Error('请输入正确的11位手机号码'))
      } else {
        callback()
      }
    }
    return {
      height: document.documentElement.clientHeight - 180 + 'px;',
      deptName: '', depts: [] as Department[], deptDatas: [] as Department[], jobs: [] as Job[], level: 3, roles: [] as Role[],
      jobDatas: [] as EntityId[], roleDatas: [] as EntityId[], // 多选时使用
      defaultProps: { children: 'children', label: 'name', isLeaf: 'leaf' },
      permission: {
        add: ['admin', 'user:add'],
        edit: ['admin', 'user:edit'],
        del: ['admin', 'user:del']
      },
      enabledTypeOptions: [
        { key: 'true', display_name: '激活' },
        { key: 'false', display_name: '锁定' }
      ],
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        nickName: [
          { required: true, message: '请输入用户昵称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        phone: [
          { required: true, trigger: 'blur', validator: validPhone }
        ],
        'dept.id': [
          { required: true, message: '部门不能为空', trigger: 'blur' }
        ],
        jobDatas: [
          {
            validator: (rule: unknown, value: string, callback: (error?: Error) => void) => {
              const selected = this.jobDatas
              if (!selected || selected.length === 0) {
                callback(new Error('请选择至少一个岗位'))
              } else {
                callback()
              }
            },
            trigger: 'change'
          }
        ],
        roleDatas: [
          {
            validator: (rule: unknown, value: string, callback: (error?: Error) => void) => {
              const selected = this.roleDatas
              if (!selected || selected.length === 0) {
                callback(new Error('请选择至少一个角色'))
              } else {
                callback()
              }
            },
            trigger: 'change'
          }
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'user'
    ])
  },
  created() {
    this.crud.msg.add = '新增成功，默认密码：123456'
  },
  mounted: function() {
    const that = this
    window.onresize = function temp() {
      that.height = document.documentElement.clientHeight - 180 + 'px;'
    }
  },
  methods: {
    // 禁止输入空格
    keydown(e: KeyboardEvent) {
      if (e.keyCode === 32) {
        e.returnValue = false
      }
    },
    changeRole(value: EntityId[]) {
      userRoles = []
      value.forEach(function(data, index) {
        const role = { id: data }
        userRoles.push(role)
      })
    },
    changeJob(value: EntityId[]) {
      userJobs = []
      value.forEach(function(data, index) {
        const job = { id: data }
        userJobs.push(job)
      })
    },
    deleteTag(value: EntityId) {
      userRoles.forEach(function(data, index) {
        if (data.id === value) {
          userRoles.splice(index, 1)
        }
      })
    },
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud: PageCrud, form: UserForm) {
      this.getRoles()
      if (form.id == null) {
        this.getDepts()
      } else {
        this.getSupDepts(form.dept.id)
      }
      this.getRoleLevel()
      this.getJobs()
      form.enabled = form.enabled === true || form.enabled === 'true' ? 'true' : 'false'
    },
    // 新增前将多选的值设置为空
    [CRUD.HOOK.beforeToAdd]() {
      this.jobDatas = []
      this.roleDatas = []
    },
    // 初始化编辑时候的角色与岗位
    [CRUD.HOOK.beforeToEdit](crud: PageCrud, form: UserForm) {
      this.getJobs()
      this.jobDatas = []
      this.roleDatas = []
      userRoles = []
      userJobs = []
      const _this = this
      form.roles.forEach(function(role, index) {
        _this.roleDatas.push(role.id)
        const rol = { id: role.id }
        userRoles.push(rol)
      })
      form.jobs.forEach(function(job, index) {
        _this.jobDatas.push(job.id)
        const data = { id: job.id }
        userJobs.push(data)
      })
    },
    // 提交前做的操作
    [CRUD.HOOK.afterValidateCU](crud: PageCrud) {
      crud.form.roles = userRoles
      crud.form.jobs = userJobs
      return true
    },
    // 获取左侧部门数据
    getDeptDatas(node: LazyNode<Department> | string, resolve?: (rows: Department[]) => void) {
      const sort = ['id,desc']
      const params: DepartmentQuery = { sort }
      if (typeof node !== 'object') {
        if (node) {
          params['name'] = node
        }
      } else if (node.level !== 0) {
        params['pid'] = node.data.id
      }
      setTimeout(() => {
        getDepts(params).then(res => {
          if (resolve) {
            resolve(res.content)
          } else {
            this.deptDatas = res.content
          }
        })
      }, 100)
    },
    getDepts() {
      getDepts({ enabled: true }).then(res => {
        this.depts = res.content
      })
    },
    getSupDepts(deptId: EntityId | null) {
      getDeptSuperior(deptId ?? 0).then(res => {
        this.depts = res.content
      })
    },
    // Element Plus resolves child nodes on expansion; roots come from depts.
    loadDepts(node: LazyNode<Department>, resolve: (rows: Department[]) => void, reject: () => void) {
      if (node.level === 0) {
        resolve(this.depts)
        return
      }
      getDepts({ enabled: true, pid: node.data.id }).then(res => {
        resolve(res.content)
      }).catch(() => reject())
    },
    // 切换部门
    handleNodeClick(data: Department) {
      if (data.pid === 0) {
        this.query.deptId = null
      } else {
        this.query.deptId = data.id
      }
      this.crud.toQuery()
    },
    // 改变状态
    changeEnabled(data: UserRecord, val: boolean) {
      this.$confirm('此操作将 "' + this.dict.label.user_status[String(val)] + '" ' + data.username + ', 是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        crudUser.edit(data).then(res => {
          this.crud.notify(this.dict.label.user_status[String(val)] + '成功', CRUD.NOTIFICATION_TYPE.SUCCESS)
        }).catch(() => {
          data.enabled = !data.enabled
        })
      }).catch(() => {
        data.enabled = !data.enabled
      })
    },
    // 获取弹窗内角色数据
    getRoles() {
      getAll().then(res => {
        this.roles = res
      }).catch(() => { })
    },
    // 获取弹窗内岗位数据
    getJobs() {
      getAllJob().then(res => {
        this.jobs = res.content
      }).catch(() => { })
    },
    // 获取权限级别
    getRoleLevel() {
      getLevel().then(res => {
        this.level = res.level
      }).catch(() => { })
    },
    checkboxT(row: UserRecord) {
      return row.id !== this.user.id
    },
    resetPwd(datas: UserRecord[]) {
      this.$confirm(`你选中了 ${datas.length} 位用户，确认重置用户的密码吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids: EntityId[] = []
        datas.forEach(val => {
          ids.push(val.id)
        })
        console.log(ids)
        crudUser.resetPwd(ids).then(() => {
          this.crud.notify('重置成功, 用户新密码:123456', CRUD.NOTIFICATION_TYPE.SUCCESS)
        }).catch(() => {})
      }).catch(() => {
      })
    }
  }
})
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .user-form > .el-form-item:nth-child(-n + 4) {
    display: flex;
    :deep(.el-input) {
      width: 207px;
    }
  }
</style>
