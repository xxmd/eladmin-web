import { defineComponent } from 'vue'
import type { ECharts } from 'echarts'
import { debounce } from '@/utils'

export default defineComponent({
  data() {
    return {
      chart: null as ECharts | null,
      resizeSidebarElement: null as Element | null,
      resizeChartHandler: () => {}
    }
  },
  mounted() {
    this.resizeChartHandler = debounce(() => {
      if (this.chart) {
        this.chart.resize()
      }
    }, 100)
    this.$_initResizeEvent()
    this.$_initSidebarResizeEvent()
  },
  beforeUnmount() {
    this.$_destroyResizeEvent()
    this.$_destroySidebarResizeEvent()
  },
  // to fixed bug when cached by keep-alive
  // https://github.com/PanJiaChen/vue-element-admin/issues/2116
  activated() {
    this.$_initResizeEvent()
    this.$_initSidebarResizeEvent()
  },
  deactivated() {
    this.$_destroyResizeEvent()
    this.$_destroySidebarResizeEvent()
  },
  methods: {
    // use $_ for mixins properties
    // https://vuejs.org/v2/style-guide/index.html#Private-property-names-essential
    $_initResizeEvent() {
      window.addEventListener('resize', this.resizeChartHandler)
    },
    $_destroyResizeEvent() {
      window.removeEventListener('resize', this.resizeChartHandler)
    },
    $_sidebarResizeHandler(e: Event) {
      if (e instanceof TransitionEvent && e.propertyName === 'width') {
        this.resizeChartHandler()
      }
    },
    $_initSidebarResizeEvent() {
      this.resizeSidebarElement = document.querySelector('.sidebar-container')
      this.resizeSidebarElement && this.resizeSidebarElement.addEventListener('transitionend', this.$_sidebarResizeHandler)
    },
    $_destroySidebarResizeEvent() {
      this.resizeSidebarElement && this.resizeSidebarElement.removeEventListener('transitionend', this.$_sidebarResizeHandler)
    }
  }
})
