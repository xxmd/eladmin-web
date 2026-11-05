import { describe, expect, it, vi } from 'vitest'
import { useCrud, type CrudApi } from '@/composables/useCrud'
import type { Job, JobForm, JobQuery } from '@/types/api'

const job: Job = { id: 1, name: '工程师', enabled: true, jobSort: 1 }
function setup() {
  const api: CrudApi<Job, JobForm, JobQuery> = {
    list: vi.fn().mockResolvedValue({ content: [job], totalElements: 11 }),
    add: vi.fn().mockResolvedValue(undefined), edit: vi.fn().mockResolvedValue(undefined), del: vi.fn().mockResolvedValue(undefined)
  }
  const crud = useCrud({ api, defaultForm: () => ({ id: null as number | string | null, name: '', enabled: true, jobSort: 999 }), toForm: (row: Job) => ({ ...row }), defaultQuery: (): JobQuery => ({ name: '' }), sort: ['jobSort,asc'] })
  return { api, crud }
}
describe('typed CRUD', () => {
  it('uses zero-based API pagination and resets searches to the first page', async () => {
    const { api, crud } = setup()
    crud.page.current = 3
    await crud.refresh()
    expect(api.list).toHaveBeenLastCalledWith({ name: '', page: 2, size: 10, sort: ['jobSort,asc'] })
    crud.query.value.name = '开发'
    await crud.search()
    expect(api.list).toHaveBeenLastCalledWith(expect.objectContaining({ name: '开发', page: 0 }))
  })
  it('does not mutate a table row when editing or cancelling a form', () => {
    const { crud } = setup()
    crud.edit(job)
    crud.form.value.name = 'changed'
    expect(job.name).toBe('工程师')
    crud.add()
    expect(crud.form.value).toEqual({ id: null, name: '', enabled: true, jobSort: 999 })
  })
  it('keeps a failed form open and clears the saving state', async () => {
    const { api, crud } = setup()
    vi.mocked(api.add).mockRejectedValue(new Error('validation failed'))
    crud.add()
    await expect(crud.save()).rejects.toThrow('validation failed')
    expect(crud.dialog.value).toBe(true)
    expect(crud.saving.value).toBe(false)
  })
  it('returns to the previous page after deleting the last row', async () => {
    const { api, crud } = setup()
    crud.page.current = 2
    await crud.refresh()
    await crud.remove([job])
    expect(api.del).toHaveBeenCalledWith([1])
    expect(crud.page.current).toBe(1)
  })
  it('ignores stale results when queries complete out of order', async () => {
    const { api, crud } = setup()
    let complete: ((value: { content: Job[]; totalElements: number }) => void) | undefined
    vi.mocked(api.list).mockImplementationOnce(() => new Promise(resolve => { complete = resolve }))
    const oldQuery = crud.refresh()
    await crud.search()
    complete?.({ content: [], totalElements: 0 })
    await oldQuery
    expect(crud.rows.value).toEqual([job])
  })
})
