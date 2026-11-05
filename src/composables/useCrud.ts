import { computed, reactive, ref, type Ref } from 'vue'
import type { EntityId, PageQuery, PageResult } from '@/types/api'

export interface CrudApi<Row, Form, Query> {
  list: (query: Query & PageQuery) => Promise<PageResult<Row>>
  add: (form: Form) => Promise<unknown>
  edit: (form: Form) => Promise<unknown>
  del: (ids: EntityId[]) => Promise<unknown>
}

/** A typed CRUD state machine. Pages own confirmation, validation and notifications. */
export function useCrud<Row extends { id: EntityId }, Form, Query extends object>(options: {
  api: CrudApi<Row, Form, Query>
  defaultForm: () => Form
  toForm: (row: Row) => Form
  defaultQuery: () => Query
  sort?: string[]
}) {
  const rows = ref<Row[]>([]) as Ref<Row[]>
  const selection = ref<Row[]>([]) as Ref<Row[]>
  const form = ref<Form>(options.defaultForm()) as Ref<Form>
  const query = ref<Query>(options.defaultQuery()) as Ref<Query>
  const page = reactive({ current: 1, size: 10, total: 0 })
  const loading = ref(false)
  const saving = ref(false)
  const dialog = ref(false)
  const mode = ref<'add' | 'edit'>('add')
  let revision = 0
  const params = computed(() => ({ ...query.value, page: page.current - 1, size: page.size, sort: options.sort }))

  async function refresh() {
    const currentRevision = ++revision
    loading.value = true
    try {
      const result = await options.api.list(params.value)
      if (currentRevision !== revision) return
      rows.value = result.content
      page.total = result.totalElements
      selection.value = []
    } finally { if (currentRevision === revision) loading.value = false }
  }
  function search() { page.current = 1; return refresh() }
  function reset() { query.value = options.defaultQuery(); return search() }
  function add() { mode.value = 'add'; form.value = options.defaultForm(); dialog.value = true }
  function edit(row: Row) { mode.value = 'edit'; form.value = options.toForm(row); dialog.value = true }
  async function save() {
    if (saving.value) return
    saving.value = true
    try {
      await options.api[mode.value](form.value)
      dialog.value = false
      await refresh()
    } finally { saving.value = false }
  }
  async function remove(items: Row[]) {
    if (!items.length) return
    await options.api.del(items.map(row => row.id))
    if (rows.value.length <= items.length && page.current > 1) page.current--
    await refresh()
  }
  return { rows, selection, form, query, page, loading, saving, dialog, mode, params, refresh, search, reset, add, edit, save, remove }
}
