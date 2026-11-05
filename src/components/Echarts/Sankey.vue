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
        series: {
          type: 'sankey',
          layout: 'none',
          focusNodeAdjacency: 'allEdges',
          data: [{
            name: 'a'
          }, {
            name: 'b'
          }, {
            name: 'a1'
          }, {
            name: 'a2'
          }, {
            name: 'b1'
          }, {
            name: 'c'
          }],
          links: [{
            source: 'a',
            target: 'a1',
            value: 5
          }, {
            source: 'a',
            target: 'a2',
            value: 3
          }, {
            source: 'b',
            target: 'b1',
            value: 8
          }, {
            source: 'a',
            target: 'b1',
            value: 3
          }, {
            source: 'b1',
            target: 'a1',
            value: 1
          }, {
            source: 'b1',
            target: 'c',
            value: 2
          }]
        }
      })
    }
  }
})
</script>
