import { defineComponent, reactive, markRaw, type ComponentPublicInstance } from 'vue'
import { ElNotification, type FormInstance } from 'element-plus'
import { initData, download } from '@/api/data'
import { parseTime, downloadFile, deepClone } from '@/utils'
import type { EntityId } from '@/types/api'

export interface CrudQuery {
  name?: string; blurry?: string; enabled?: string | boolean; createTime?: string[]
  dictName?: string; logType?: string; deployDate?: string[]; [key: string]: unknown
}
export interface CrudColumn { property: string; label: string; type?: string }
export interface CrudTable<R> {
  lazy?: boolean
  columns: CrudColumn[]
  store: { states: { treeData: { value: Record<string, unknown> }; lazyTreeNodeMap: { value: Record<string, R[]> } } }
  clearSelection(): void
  toggleRowSelection(row: R, selected: boolean): void
  getSelectionRows(): R[]
}
export interface CrudMethods<F> {
  add?(form: F): Promise<unknown>
  edit?(form: F): Promise<unknown>
  del?(ids: EntityId[]): Promise<unknown>
}
export interface CrudOptions<R extends object, F extends object, Q extends object> {
  tag?: string; idField?: string; title?: string; url?: string; data?: R[]; selections?: R[]
  query?: Q; params?: Record<string, unknown>; defaultForm?: F | (() => F)
  sort?: string | string[]; time?: number; crudMethod?: CrudMethods<F>
  optShow?: Partial<Record<'add' | 'edit' | 'del' | 'download' | 'reset', boolean>>
  props?: Record<string, unknown>; queryOnPresenterCreated?: boolean; debug?: boolean
}
type NotificationType = 'success' | 'warning' | 'info' | 'error'
type Status = { delete: number; edit: number }
type VM = ComponentPublicInstance
const hosts = new WeakMap<VM, Map<string, unknown>>()
function record(value: object): Record<string, unknown> { return value as Record<string, unknown> }

export class CrudController<R extends object = Record<string, unknown>, F extends object = Record<string, unknown>, Q extends object = CrudQuery> {
  tag: string; idField: string; title: string; url: string; sort: string | string[]; time: number
  queryOnPresenterCreated: boolean; debug: boolean
  data: R[]; selections: R[]; query: Q; defaultQuery: Q; params: Record<string, unknown>
  form: F; defaultForm: F | (() => F); crudMethod: CrudMethods<F>
  props: { hiddenColumns: string[]; searchToggle?: boolean; table?: CrudTable<R>; [key: string]: unknown }
  optShow: Partial<Record<'add' | 'edit' | 'del' | 'download' | 'reset', boolean>>
  dataStatus: Record<string, Status> = {}
  page = { page: 0, size: 10, total: 0 }
  loading = false
  downloadLoading = false
  delAllLoading = false
  msg = { submit: '提交成功', add: '新增成功', edit: '编辑成功', del: '删除成功' }
  status: { add: number; edit: number; readonly cu: number; readonly title: string }
  vms: Array<{ type: string; vm: VM }> = []
  constructor(options: CrudOptions<R, F, Q>) {
    this.tag = options.tag ?? 'default'; this.idField = options.idField ?? 'id'
    this.title = options.title ?? ''; this.url = options.url ?? ''; this.sort = options.sort ?? ['id,desc']; this.time = options.time ?? 0
    this.queryOnPresenterCreated = options.queryOnPresenterCreated ?? true; this.debug = options.debug ?? false
    this.data = options.data ?? []; this.selections = options.selections ?? []
    // Empty objects exist only until the form/header binding installs its typed defaults.
    this.query = options.query ?? {} as Q; this.defaultQuery = deepClone(this.query); this.params = options.params ?? {}
    this.defaultForm = options.defaultForm ?? {} as F
    this.form = deepClone(typeof this.defaultForm === 'function' ? this.defaultForm() : this.defaultForm)
    this.crudMethod = options.crudMethod ?? {}
    this.props = { hiddenColumns: [], ...options.props }
    this.optShow = { add: true, edit: true, del: true, download: true, reset: true, ...options.optShow }
    const owner = this
    this.status = { add: 0, edit: 0,
      get cu() { return Math.max(this.add, this.edit) },
      get title() { return this.add ? `新增${owner.title}` : this.edit ? `编辑${owner.title}` : owner.title }
    }
  }
  hook(name: string, ...args: unknown[]): boolean {
    let accepted = true
    for (const vm of new Set(this.vms.map(entry => entry.vm))) {
      for (const key of [name, `${name}$${this.tag}`]) {
        const callback: unknown = Reflect.get(vm, key)
        if (typeof callback === 'function') accepted = callback.apply(vm, [this, ...args]) !== false && accepted
      }
    }
    return accepted
  }
  registerVM(type: string, vm: VM) { this.vms.push({ type, vm: markRaw(vm) }) }
  unregisterVM(type: string, vm: VM) { this.vms = this.vms.filter(entry => entry.type !== type || entry.vm !== vm) }
  findVM(type: string) { return this.vms.find(entry => entry.type === type)?.vm }
  getTable(): CrudTable<R> | undefined { return this.findVM('presenter')?.$refs.table as CrudTable<R> | undefined }
  getForm(): FormInstance | undefined { return this.findVM('form')?.$refs.form as FormInstance | undefined }
  attchTable() { this.props.table = this.getTable() }
  getDataId(data: object): EntityId {
    const id = record(data)[this.idField]
    if (typeof id !== 'string' && typeof id !== 'number') throw new Error(`Missing CRUD identifier: ${this.idField}`)
    return id
  }
  children(row: R): R[] { const value = record(row).children; return Array.isArray(value) ? value as R[] : [] }
  getDataStatus(id: EntityId): Status { return this.dataStatus[id] ?? (this.dataStatus[id] = { delete: 0, edit: 0 }) }
  resetDataStatus() {
    this.dataStatus = {}
    const visit = (rows: R[]) => rows.forEach(row => { this.getDataStatus(this.getDataId(row)); visit(this.children(row)) })
    visit(this.data)
  }
  getQueryParams() {
    const clean = (value: object) => Object.fromEntries(Object.entries(value).filter(([, item]) => item !== null && item !== '' && item !== undefined))
    return { page: this.page.page - 1, size: this.page.size, sort: this.sort, ...clean(this.query), ...clean(this.params) }
  }
  async refresh() {
    if (!this.hook(HOOK.beforeRefresh)) return
    this.loading = true
    try {
      const result = await initData<R>(this.url, this.getQueryParams())
      const table = this.getTable()
      if (table?.lazy) { table.store.states.treeData.value = {}; table.store.states.lazyTreeNodeMap.value = {} }
      this.page.total = result.totalElements; this.data = result.content; this.resetDataStatus()
      if (this.time) await new Promise(resolve => setTimeout(resolve, this.time))
      this.hook(HOOK.afterRefresh)
      return result
    } finally { this.loading = false }
  }
  toQuery() { this.page.page = 1; return this.refresh() }
  pageChangeHandler(page: number) { this.page.page = page; return this.refresh() }
  sizeChangeHandler(size: number) { this.page.size = size; return this.toQuery() }
  dleChangePage(size = 1) { if (this.data.length === size && this.page.page > 1) this.page.page-- }
  selectionChangeHandler(rows: R[]) { this.selections = rows }
  resetQuery(toQuery = true) {
    for (const key of Object.keys(this.query)) delete record(this.query)[key]
    Object.assign(this.query, deepClone(this.defaultQuery)); this.params = {}
    if (toQuery) return this.toQuery()
  }
  resetForm(data?: R | F) {
    const initial = typeof this.defaultForm === 'function' ? this.defaultForm.call(this.findVM('form')) : this.defaultForm
    for (const key of Object.keys(this.form)) delete record(this.form)[key]
    Object.assign(this.form, deepClone(initial), data ? deepClone(data) : {}); this.getForm()?.clearValidate()
  }
  toAdd() {
    this.resetForm()
    if (!this.hook(HOOK.beforeToAdd, this.form) || !this.hook(HOOK.beforeToCU, this.form)) return
    this.status.add = 1; this.hook(HOOK.afterToAdd, this.form); this.hook(HOOK.afterToCU, this.form)
  }
  toEdit(row: R) {
    this.resetForm(row)
    if (!this.hook(HOOK.beforeToEdit, this.form) || !this.hook(HOOK.beforeToCU, this.form)) return
    this.status.edit = 1; this.getDataStatus(this.getDataId(row)).edit = 1
    this.hook(HOOK.afterToEdit, this.form); this.hook(HOOK.afterToCU, this.form)
  }
  toDelete(row: R) { this.getDataStatus(this.getDataId(row)).delete = 1 }
  cancelDelete(row: R) { if (this.hook(HOOK.beforeDeleteCancel, row)) { this.getDataStatus(this.getDataId(row)).delete = 0; this.hook(HOOK.afterDeleteCancel, row) } }
  cancelCU() {
    const adding = this.status.add === 1; const editing = this.status.edit === 1
    if (adding && !this.hook(HOOK.beforeAddCancel, this.form) || editing && !this.hook(HOOK.beforeEditCancel, this.form)) return
    if (editing) this.getDataStatus(this.getDataId(this.form)).edit = 0
    this.status.add = 0; this.status.edit = 0; this.resetForm()
    if (adding) this.hook(HOOK.afterAddCancel, this.form)
    if (editing) this.hook(HOOK.afterEditCancel, this.form)
  }
  async submitCU() {
    if (!this.hook(HOOK.beforeValidateCU)) return
    const valid = await this.getForm()?.validate().catch(() => false)
    if (!valid || !this.hook(HOOK.afterValidateCU)) return
    return this.status.add === 1 ? this.doAdd() : this.doEdit()
  }
  async save(editing: boolean) {
    if (!this.hook(HOOK.beforeSubmit)) return
    const action = editing ? this.crudMethod.edit : this.crudMethod.add
    if (!action) throw new Error('CRUD save method is not configured')
    const key = editing ? 'edit' : 'add'; this.status[key] = 2
    try {
      await action(this.form)
      if (editing) this.getDataStatus(this.getDataId(this.form)).edit = 0
      this.status[key] = 0; this.resetForm(); this.notify(this.msg[key], 'success'); this.hook(HOOK.afterSubmit)
      await (editing ? this.refresh() : this.toQuery())
    } catch { this.status[key] = 1; this.hook(editing ? HOOK.afterEditError : HOOK.afterAddError) }
  }
  doAdd() { return this.save(false) }
  doEdit() { return this.save(true) }
  async doDelete(data: R | R[]) {
    if (!this.hook(HOOK.beforeDelete, data)) return
    const rows = Array.isArray(data) ? data : [data]; const ids = rows.map(row => this.getDataId(row))
    const status = Array.isArray(data) ? undefined : this.getDataStatus(ids[0])
    if (status) status.delete = 2
    try {
      if (!this.crudMethod.del) throw new Error('CRUD delete method is not configured')
      await this.crudMethod.del(ids); this.dleChangePage(rows.length); this.delSuccessNotify(); this.hook(HOOK.afterDelete, data)
      await this.refresh()
    } finally { if (status) status.delete = 0; this.delAllLoading = false }
  }
  async doExport() {
    this.downloadLoading = true
    try { downloadFile(await download(this.url + '/download', this.getQueryParams()), this.title + '数据', 'xlsx') }
    finally { this.downloadLoading = false }
  }
  notify(title: string, type: NotificationType = 'info') { ElNotification({ title, type, duration: 2500 }) }
  submitSuccessNotify() { this.notify(this.msg.submit, 'success') }
  addSuccessNotify() { this.notify(this.msg.add, 'success') }
  editSuccessNotify() { this.notify(this.msg.edit, 'success') }
  delSuccessNotify() { this.notify(this.msg.del, 'success') }
  columnVisible(property: string) { return !this.props.hiddenColumns.includes(property) }
  updateProp(name: string, value: unknown) { this.props[name] = value }
  selectAllChange(selection: R[]) { if (selection.length === this.data.length) [...selection].forEach(row => this.selectChange(selection, row)); else this.getTable()?.clearSelection() }
  selectChange(selection: R[], row: R) {
    if (!selection.some(value => this.getDataId(value) === this.getDataId(row))) { this.toggleRowSelection(selection, row); return }
    for (const child of this.children(row)) { this.getTable()?.toggleRowSelection(child, true); if (!selection.includes(child)) selection.push(child); this.selectChange(selection, child) }
  }
  toggleRowSelection(selection: R[], row: R) {
    for (const child of this.children(row)) { const index = selection.findIndex(value => this.getDataId(value) === this.getDataId(child)); if (index >= 0) selection.splice(index, 1); this.getTable()?.toggleRowSelection(child, false); this.toggleRowSelection(selection, child) }
  }
  expandChange(row: R, expanded: boolean | R[]) {
    if (!expanded) return
    const children = this.getTable()?.store.states.lazyTreeNodeMap.value[this.getDataId(row)]
    if (children) record(row).children = children
    this.children(row).forEach(child => this.getDataStatus(this.getDataId(child)))
  }
}
function createCrud<R extends object = Record<string, unknown>, F extends object = Record<string, unknown>, Q extends object = CrudQuery>(options: CrudOptions<R, F, Q>) {
  // Vue unwraps generic object members; this boundary preserves the controller's public generic contract.
  const controller = reactive(new CrudController<R, F, Q>(options)) as CrudController<R, F, Q>
  for (const name of Object.getOwnPropertyNames(CrudController.prototype)) {
    const method: unknown = Reflect.get(controller, name)
    if (name !== 'constructor' && typeof method === 'function') Object.defineProperty(controller, name, { value: method.bind(controller), configurable: true })
  }
  return controller
}
function lookup<R extends object, F extends object, Q extends object>(vm: VM): CrudController<R, F, Q> {
  const tag = String(vm.$attrs['crud-tag'] ?? 'default')
  let parent: VM | null = vm
  while (parent) {
    const host = hosts.get(parent); const value = host?.get(tag) ?? (parent === vm ? host?.values().next().value : undefined)
    if (value) return value as CrudController<R, F, Q>
    parent = parent.$parent
  }
  throw new Error(`CRUD presenter not found: ${tag}`)
}
declare module 'vue' { interface ComponentCustomOptions { cruds?: () => unknown } }
export function crudBindings<R extends object = Record<string, unknown>, F extends object = Record<string, unknown>, Q extends object = CrudQuery>() {
  const binding = (type: string) => defineComponent({
    data() { return { crud: lookup<R, F, Q>(this) } },
    created() { this.crud.registerVM(type, this) },
    unmounted() { this.crud.unregisterVM(type, this) }
  })
  return {
    presenter: () => defineComponent({
      beforeCreate() {
        const configured = this.$options.cruds?.()
        const controllers = (Array.isArray(configured) ? configured : [configured]) as CrudController<R, F, Q>[]
        if (!controllers.length || controllers.some(value => !(value instanceof CrudController))) throw new Error('Invalid CRUD presenter configuration')
        hosts.set(this, new Map(controllers.map(value => [value.tag, value])))
      },
      data() { return { crud: lookup<R, F, Q>(this) } },
      methods: { parseTime },
      created() { this.crud.registerVM('presenter', this); if (this.crud.queryOnPresenterCreated) void this.crud.toQuery() },
      mounted() { this.crud.attchTable() },
      unmounted() { this.crud.unregisterVM('presenter', this); hosts.delete(this) }
    }),
    header: () => defineComponent({ mixins: [binding('header')], data() { return { query: lookup<R, F, Q>(this).query } } }),
    pagination: () => defineComponent({ mixins: [binding('pagination')], data() { return { page: lookup<R, F, Q>(this).page } } }),
    form: (defaultForm: F | (() => F)) => defineComponent({
      mixins: [binding('form')],
      data() { return { form: lookup<R, F, Q>(this).form } },
      created() { const controller = lookup<R, F, Q>(this); controller.defaultForm = defaultForm; controller.resetForm() }
    }),
    crud: (options: { type?: string } = {}) => binding(options.type ?? 'component')
  }
}
export const { presenter, header, pagination, crud } = crudBindings()
export function form<F extends object>(defaultForm: F | (() => F)) { return crudBindings<Record<string, unknown>, F>().form(defaultForm) }

const HOOK = {
  /** 刷新 - 之前 */
  beforeRefresh: 'beforeCrudRefresh',
  /** 刷新 - 之后 */
  afterRefresh: 'afterCrudRefresh',
  /** 删除 - 之前 */
  beforeDelete: 'beforeCrudDelete',
  /** 删除 - 之后 */
  afterDelete: 'afterCrudDelete',
  /** 删除取消 - 之前 */
  beforeDeleteCancel: 'beforeCrudDeleteCancel',
  /** 删除取消 - 之后 */
  afterDeleteCancel: 'afterCrudDeleteCancel',
  /** 新建 - 之前 */
  beforeToAdd: 'beforeCrudToAdd',
  /** 新建 - 之后 */
  afterToAdd: 'afterCrudToAdd',
  /** 编辑 - 之前 */
  beforeToEdit: 'beforeCrudToEdit',
  /** 编辑 - 之后 */
  afterToEdit: 'afterCrudToEdit',
  /** 开始 "新建/编辑" - 之前 */
  beforeToCU: 'beforeCrudToCU',
  /** 开始 "新建/编辑" - 之后 */
  afterToCU: 'afterCrudToCU',
  /** "新建/编辑" 验证 - 之前 */
  beforeValidateCU: 'beforeCrudValidateCU',
  /** "新建/编辑" 验证 - 之后 */
  afterValidateCU: 'afterCrudValidateCU',
  /** 添加取消 - 之前 */
  beforeAddCancel: 'beforeCrudAddCancel',
  /** 添加取消 - 之后 */
  afterAddCancel: 'afterCrudAddCancel',
  /** 编辑取消 - 之前 */
  beforeEditCancel: 'beforeCrudEditCancel',
  /** 编辑取消 - 之后 */
  afterEditCancel: 'afterCrudEditCancel',
  /** 提交 - 之前 */
  beforeSubmit: 'beforeCrudSubmitCU',
  /** 提交 - 之后 */
  afterSubmit: 'afterCrudSubmitCU',
  afterAddError: 'afterCrudAddError',
  afterEditError: 'afterCrudEditError'
} as const

/**
 * CRUD状态
 */
const STATUS = {
  NORMAL: 0,
  PREPARED: 1,
  PROCESSING: 2
} as const

/**
 * CRUD通知类型
 */
const NOTIFICATION_TYPE = {
  SUCCESS: 'success',
  WARNING: 'warning',
  INFO: 'info',
  ERROR: 'error'
} as const


export default Object.assign(createCrud, { HOOK, STATUS, NOTIFICATION_TYPE })
