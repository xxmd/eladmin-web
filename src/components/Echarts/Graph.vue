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
      const axisData = ['周一', '周二', '周三', '很长很长的周四', '周五', '周六', '周日']
      const data = axisData.map(function(item, i) {
        return Math.round(Math.random() * 1000 * (i + 1))
      })
      const links = data.map(function(item, i) {
        return {
          source: i,
          target: i + 1
        }
      })
      links.pop()
      this.chart.setOption({
        title: {
          text: '笛卡尔坐标系上的 Graph'
        },
        tooltip: {},
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: axisData
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            type: 'graph',
            layout: 'none',
            coordinateSystem: 'cartesian2d',
            symbolSize: 40,
            label: {
              normal: {
                show: true
              }
            },
            edgeSymbol: ['circle', 'arrow'],
            edgeSymbolSize: [4, 10],
            data: data,
            links: links,
            lineStyle: {
              normal: {
                color: '#2f4554'
              }
            }
          }
        ]
      })
    }
  }
})
</script>
