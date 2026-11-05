import { defineComponent } from 'vue'
import { ElNotification } from 'element-plus'
import { initData, download } from '@/api/data'
import { parseTime, downloadFile } from '@/utils'
import type { CrudQuery } from '@/components/Crud/crud'

// Remaining consumers use pagination and notifications, not the legacy mutation API.
export default function listMixin<Row extends object>() {
  return defineComponent({
    data() {
      return { data: [] as Row[], sort: ['id,desc'] as string | string[], page: 0, size: 10, total: 0,
        url: '', params: {} as Record<string, unknown>, query: {} as CrudQuery, time: 50,
        loading: true, downloadLoading: false, dialog: false, title: '' }
    },
    methods: {
      parseTime, downloadFile,
      beforeInit(): boolean | Promise<boolean> { return true },
      async init() {
        if (!await this.beforeInit()) return
        this.loading = true
        try {
          const result = await initData<Row>(this.url, this.getQueryParams())
          this.data = result.content as typeof this.data; this.total = result.totalElements
          if (this.time) await new Promise(resolve => setTimeout(resolve, this.time))
          return result
        } finally { this.loading = false }
      },
      getQueryParams() {
        const clean = (value: object) => Object.fromEntries(Object.entries(value).filter(([, item]) => item !== '' && item !== null && item !== undefined))
        return { page: this.page, size: this.size, sort: this.sort, ...clean(this.query), ...clean(this.params) }
      },
      pageChange(page: number) { this.page = page - 1; return this.init() },
      sizeChange(size: number) { this.page = 0; this.size = size; return this.init() },
      toQuery() { this.page = 0; return this.init() },
      dleChangePage(count = 1) { if (this.data.length === count && this.page > 0) this.page-- },
      notify(title: string, type: 'success' | 'warning' | 'info' | 'error') { ElNotification({ title, type, duration: 2500 }) },
      editSuccessNotify() { this.notify('编辑成功', 'success') },
      async downloadMethod() {
        if (!await this.beforeInit()) return
        this.downloadLoading = true
        try { downloadFile(await download(this.url + '/download', this.getQueryParams()), this.title + '数据', 'xlsx') }
        finally { this.downloadLoading = false }
      }
    }
  })
}
