<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { markRaw } from 'vue'
import * as echarts from 'echarts'

import 'echarts/theme/macarons.js' // echarts theme
import { debounce } from '@/utils'

export default defineComponent({
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '300px'
    }
  },
  data() {
    return {
      chart: null as echarts.ECharts | null,
      resizeHandler: () => {}
    }
  },
  mounted() {
    this.initChart()
    this.resizeHandler = debounce(() => {
      if (this.chart) {
        this.chart.resize()
      }
    }, 100)
    window.addEventListener('resize', this.resizeHandler)
  },
  beforeUnmount() {
    if (!this.chart) {
      return
    }
    window.removeEventListener('resize', this.resizeHandler)
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = markRaw(echarts.init(this.$el, 'macarons'))

      this.chart.setOption({
        tooltip: {
          formatter: '{a} <br/>{b} : {c}%'
        },
        toolbox: {
          feature: {
            restore: {},
            saveAsImage: {}
          }
        },
        series: [
          {
            name: '业务指标',
            type: 'gauge',
            detail: { formatter: '{value}%' },
            data: [{ value: 50, name: '完成率' }]
          }
        ]
      })
    }
  }
})
</script>
