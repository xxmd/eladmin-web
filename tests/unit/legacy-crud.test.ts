import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import CRUD, { crudBindings } from '@/components/Crud/crud'
import listMixin from '@/mixins/crud'
import { initData } from '@/api/data'

vi.mock('@/api/data', () => ({ initData: vi.fn(), download: vi.fn() }))
vi.mock('element-plus', () => ({ ElNotification: vi.fn() }))
interface Row { id: number; name: string; children?: Row[] }
interface Form { id: number | null; name: string }
const initial: Form = { id: null, name: '' }
beforeEach(() => { vi.clearAllMocks(); vi.mocked(initData).mockResolvedValue({ content: [], totalElements: 0 }) })
function fixture() {
  const add = vi.fn().mockResolvedValue(undefined)
  const edit = vi.fn().mockResolvedValue(undefined)
  const del = vi.fn().mockResolvedValue(undefined)
  const controller = CRUD<Row, Form>({ url: '/rows', defaultForm: initial, queryOnPresenterCreated: false, crudMethod: { add, edit, del } })
  return { controller, add, edit, del }
}
describe('migrated shared CRUD', () => {
  it('keeps form bindings alive across editing, cancel and add, and deduplicates hooks', () => {
    const { controller } = fixture()
    const bindings = crudBindings<Row, Form>()
    const beforeAdd = vi.fn()
    const wrapper = mount(defineComponent({
      cruds: () => controller,
      mixins: [bindings.presenter(), bindings.header(), bindings.form(initial), bindings.crud()],
      methods: { [CRUD.HOOK.beforeToAdd]: beforeAdd },
      render: () => h('div')
    }))
    const boundForm = wrapper.vm.form
    controller.toEdit({ id: 1, name: 'existing' })
    expect(boundForm.name).toBe('existing')
    controller.cancelCU()
    controller.toAdd()
    expect(wrapper.vm.form).toBe(boundForm)
    expect(boundForm).toEqual(initial)
    expect(beforeAdd).toHaveBeenCalledTimes(1)
    wrapper.unmount()
    expect(controller.vms).toHaveLength(0)
  })
  it('uses zero-based request pages, strips empty filters and resets the search', async () => {
    const { controller } = fixture()
    controller.page.page = 3
    controller.query.name = ''
    controller.query.enabled = false
    await controller.refresh()
    expect(initData).toHaveBeenLastCalledWith('/rows', { page: 2, size: 10, sort: ['id,desc'], enabled: false })
    await controller.resetQuery()
    expect(controller.query).toEqual({})
    expect(controller.page.page).toBe(1)
  })
  it('binds callbacks and restores an editable form after a failed save', async () => {
    const { controller, add } = fixture()
    const { toAdd } = controller
    toAdd()
    controller.form.name = 'draft'
    add.mockRejectedValueOnce(new Error('offline'))
    await controller.doAdd()
    expect(controller.status.add).toBe(1)
    expect(controller.form.name).toBe('draft')
    await controller.doAdd()
    expect(controller.status.add).toBe(0)
    expect(controller.form).toEqual(initial)
  })
  it('moves back after deleting the final selected page and releases loading on failure', async () => {
    const { controller, del } = fixture()
    controller.page.page = 2
    controller.data = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }]
    await controller.doDelete(controller.data)
    expect(del).toHaveBeenCalledWith([1, 2])
    expect(controller.page.page).toBe(1)
    vi.mocked(initData).mockRejectedValueOnce(new Error('offline'))
    await expect(controller.refresh()).rejects.toThrow('offline')
    expect(controller.loading).toBe(false)
  })
  it('does not remove unrelated selected rows when a tree child was not selected', () => {
    const { controller } = fixture()
    const unrelated = { id: 9, name: 'unrelated' }
    const selection = [unrelated]
    controller.toggleRowSelection(selection, { id: 1, name: 'parent', children: [{ id: 2, name: 'child' }] })
    expect(selection).toEqual([unrelated])
  })
})
describe('migrated paginated list mixin', () => {
  it('uses the caller row type, awaits beforeInit and resets the page for search', async () => {
    vi.mocked(initData).mockResolvedValue({ content: [{ id: 2, name: 'result' }], totalElements: 1 })
    const wrapper = mount(defineComponent({ mixins: [listMixin<Row>()],
      methods: { async beforeInit() { this.url = '/logs'; this.time = 0; return true } }, render: () => h('div') }))
    await wrapper.vm.pageChange(3)
    expect(initData).toHaveBeenLastCalledWith('/logs', { page: 2, size: 10, sort: ['id,desc'] })
    expect(wrapper.vm.data[0].name).toBe('result')
    await wrapper.vm.toQuery()
    expect(wrapper.vm.page).toBe(0)
    wrapper.unmount()
  })
})
