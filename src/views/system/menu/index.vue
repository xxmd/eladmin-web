<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.blurry" clearable placeholder="模糊搜索" style="width: 200px;" class="filter-item" @keyup.enter="crud.toQuery" />
        <date-range-picker v-model="query.createTime" class="date-item" />
        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>
    <!--表单渲染-->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :model-value="crud.status.cu > 0" :title="crud.status.title" width="580px">
      <el-form ref="form" :inline="true" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="form.type" style="width: 178px">
            <el-radio-button value="0">目录</el-radio-button>
            <el-radio-button value="1">菜单</el-radio-button>
            <el-radio-button value="2">按钮</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-show="form.type.toString() !== '2'" label="菜单图标" prop="icon">
          <el-popover
            placement="bottom-start"
            width="450"
            trigger="click"
            @show="resetIconSelect"
          >
            <IconSelect ref="iconSelect" @selected="selected" />
            <template #reference><el-input  v-model="form.icon" style="width: 450px;" placeholder="点击选择图标" readonly>
              <template #prefix><svg-icon v-if="form.icon"  :icon-class="form.icon" class="el-input__icon" style="height: 32px;width: 16px;" />
              <IconSearch v-else  class="legacy-icon el-input__icon" /></template>
            </el-input></template>
          </el-popover>
        </el-form-item>
        <el-form-item v-show="form.type.toString() !== '2'" label="外链菜单" prop="iFrame">
          <el-radio-group v-model="form.iFrame">
            <el-radio-button value="true">是</el-radio-button>
            <el-radio-button value="false">否</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-show="form.type.toString() === '1'" label="菜单缓存" prop="cache">
          <el-radio-group v-model="form.cache">
            <el-radio-button value="true">是</el-radio-button>
            <el-radio-button value="false">否</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-show="form.type.toString() !== '2'" label="菜单可见" prop="hidden">
          <el-radio-group v-model="form.hidden">
            <el-radio-button value="false">是</el-radio-button>
            <el-radio-button value="true">否</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.type.toString() !== '2'" label="菜单标题" prop="title">
          <el-input v-model="form.title" :style=" form.type.toString() === '0' ? 'width: 450px' : 'width: 178px'" placeholder="菜单标题" />
        </el-form-item>
        <el-form-item v-if="form.type.toString() === '2'" label="按钮名称" prop="title">
          <el-input v-model="form.title" placeholder="按钮名称" style="width: 178px;" />
        </el-form-item>
        <el-form-item v-show="form.type.toString() !== '0'" label="权限标识" prop="permission">
          <el-input v-model="form.permission" :disabled="form.iFrame.toString() === 'true'" placeholder="权限标识" style="width: 178px;" />
        </el-form-item>
        <el-form-item v-if="form.type.toString() !== '2'" label="路由地址" prop="path">
          <el-input v-model="form.path" placeholder="路由地址" style="width: 178px;" />
        </el-form-item>
        <el-form-item label="菜单排序" prop="menuSort">
          <el-input-number v-model.number="form.menuSort" :min="0" :max="999" controls-position="right" style="width: 178px;" />
        </el-form-item>
        <el-form-item v-show="form.iFrame.toString() !== 'true' && form.type.toString() === '1'" label="组件名称" prop="componentName">
          <el-input v-model="form.componentName" style="width: 178px;" placeholder="匹配组件内Name字段" />
        </el-form-item>
        <el-form-item v-show="form.iFrame.toString() !== 'true' && form.type.toString() === '1'" label="组件路径" prop="component">
          <el-input v-model="form.component" style="width: 178px;" placeholder="组件路径" />
        </el-form-item>
        <el-form-item label="上级类目" prop="pid">
          <treeselect
            v-model="form.pid"
            :options="menus"
            :load-options="loadMenus"
            style="width: 450px;"
            placeholder="选择上级类目"
          />
        </el-form-item>
      </el-form>
      <template #footer><div  class="dialog-footer">
        <el-button type="primary" link @click="crud.cancelCU">取消</el-button>
        <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
      </div></template>
    </el-dialog>
    <!--表格渲染-->
    <el-table
      @expand-change="crud.expandChange" ref="table"
      v-loading="crud.loading"
      lazy
      :load="getMenus"
      :data="crud.data"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      row-key="id"
      @select="crud.selectChange"
      @select-all="crud.selectAllChange"
      @selection-change="crud.selectionChangeHandler"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column v-if="crud.columnVisible('title')" :show-overflow-tooltip="true" label="菜单标题" width="125px" prop="title" />
      <el-table-column v-if="crud.columnVisible('icon')" prop="icon" label="图标" align="center" width="60px">
        <template #default="scope">
          <svg-icon :icon-class="scope.row.icon ? scope.row.icon : ''" />
        </template>
      </el-table-column>
      <el-table-column v-if="crud.columnVisible('menuSort')" prop="menuSort" align="center" label="排序">
        <template #default="scope">
          {{ scope.row.menuSort }}
        </template>
      </el-table-column>
      <el-table-column v-if="crud.columnVisible('permission')" :show-overflow-tooltip="true" prop="permission" label="权限标识" />
      <el-table-column v-if="crud.columnVisible('component')" :show-overflow-tooltip="true" prop="component" label="组件路径" />
      <el-table-column v-if="crud.columnVisible('iFrame')" prop="iFrame" label="外链" width="75px">
        <template #default="scope">
          <span v-if="scope.row.iFrame">是</span>
          <span v-else>否</span>
        </template>
      </el-table-column>
      <el-table-column v-if="crud.columnVisible('cache')" prop="cache" label="缓存" width="75px">
        <template #default="scope">
          <span v-if="scope.row.cache">是</span>
          <span v-else>否</span>
        </template>
      </el-table-column>
      <el-table-column v-if="crud.columnVisible('hidden')" prop="hidden" label="可见" width="75px">
        <template #default="scope">
          <span v-if="scope.row.hidden">否</span>
          <span v-else>是</span>
        </template>
      </el-table-column>
      <el-table-column v-if="crud.columnVisible('createTime')" prop="createTime" label="创建日期" width="135px" />
      <el-table-column v-if="checkPer(['admin','menu:edit','menu:del'])" label="操作" width="130px" align="center" fixed="right">
        <template #default="scope">
          <udOperation
            :data="scope.row"
            :permission="permission"
            msg="确定删除吗,如果存在下级节点则一并删除，此操作不能撤销！"
          />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import crudMenu from '@/api/system/menu'
import IconSelect from '@/components/IconSelect/index.vue'
import Treeselect from '@zanmato/vue3-treeselect'
import '@zanmato/vue3-treeselect/dist/vue3-treeselect.min.css'
import { LOAD_CHILDREN_OPTIONS } from '@zanmato/vue3-treeselect'
import CRUD, { crudBindings, type CrudController } from '@crud/crud'
import type { Menu, MenuForm, TreeLoadOptions } from '@/types/business'
const { presenter, header, form, crud } = crudBindings<Menu, MenuForm>()
import type { EntityId } from '@/types/api'
interface MenuOption { id: EntityId; label?: string; children?: MenuOption[] | null; leaf?: boolean }
type PageCrud = CrudController<Menu, MenuForm>
import rrOperation from '@crud/RR.operation.vue'
import crudOperation from '@crud/CRUD.operation.vue'
import udOperation from '@crud/UD.operation.vue'
import DateRangePicker from '@/components/DateRangePicker/index.vue'

// crud交由presenter持有
const defaultForm: MenuForm = { id: null, title: '', menuSort: 999, path: '', component: '', componentName: '', iFrame: false, roles: [], pid: 0, icon: '', cache: false, hidden: false, type: 0, permission: '' }
export default defineComponent({
  name: 'Menu',
  components: { Treeselect, IconSelect, crudOperation, rrOperation, udOperation, DateRangePicker },
  cruds() {
    return CRUD<Menu, MenuForm>({ title: '菜单', url: 'api/menus', crudMethod: { ...crudMenu }})
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  data() {
    return {
      menus: [] as MenuOption[],
      permission: {
        add: ['admin', 'menu:add'],
        edit: ['admin', 'menu:edit'],
        del: ['admin', 'menu:del']
      },
      rules: {
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' }
        ],
        path: [
          { required: true, message: '请输入地址', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetIconSelect() { (this.$refs.iconSelect as InstanceType<typeof IconSelect>).reset() },
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud: PageCrud, form: MenuForm) {
      this.menus = []
      if (form.id != null) {
        if (form.pid === null) {
          form.pid = 0
        }
        this.getSupDepts(form.id)
      } else {
        this.menus.push({ id: 0, label: '顶级类目', children: null })
      }
    },
    getMenus(tree: Menu, treeNode: unknown, resolve: (rows: Menu[]) => void) {
      const params = { pid: tree.id }
      setTimeout(() => {
        crudMenu.getMenus(params).then(res => {
          resolve(res.content)
        })
      }, 100)
    },
    getSupDepts(id: EntityId) {
      crudMenu.getMenuSuperior(id).then(res => {
        const children = res.map(function(obj) {
          if (!obj.leaf && !obj.children) {
            obj.children = null
          }
          return obj
        })
        this.menus = [{ id: 0, label: '顶级类目', children: children }]
      })
    },
    loadMenus({ action, parentNode, callback }: TreeLoadOptions<MenuOption>) {
      if (action === LOAD_CHILDREN_OPTIONS) {
        crudMenu.getMenusTree(parentNode.id).then(res => {
          parentNode.children = res.map(function(obj) {
            if (!obj.leaf) {
              obj.children = null
            }
            return obj
          })
          setTimeout(() => {
            callback()
          }, 100)
        })
      }
    },
    // 选中图标
    selected(name: string) {
      this.form.icon = name
    }
  }
})
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
 :deep(.el-input-number .el-input__inner) {
    text-align: left;
  }
 :deep(.vue-treeselect__control, .vue-treeselect__placeholder, .vue-treeselect__single-value) {
    height: 30px;
    line-height: 30px;
  }
</style>
