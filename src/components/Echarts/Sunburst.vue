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
      const data = [{
        name: 'Grandpa',
        children: [{
          name: 'Uncle Leo',
          value: 15,
          children: [{
            name: 'Cousin Jack',
            value: 2
          }, {
            name: 'Cousin Mary',
            value: 5,
            children: [{
              name: 'Jackson',
              value: 2
            }]
          }, {
            name: 'Cousin Ben',
            value: 4
          }]
        }, {
          name: 'Father',
          value: 10,
          children: [{
            name: 'Me',
            value: 5
          }, {
            name: 'Brother Peter',
            value: 1
          }]
        }]
      }, {
        name: 'Nancy',
        children: [{
          name: 'Uncle Nike',
          children: [{
            name: 'Cousin Betty',
            value: 1
          }, {
            name: 'Cousin Jenny',
            value: 2
          }]
        }]
      }]
      this.chart.setOption({
        series: {
          type: 'sunburst',
          data: data,
          radius: [0, '90%'],
          label: {
            rotate: 'radial'
          }
        }
      })
    }
  }
})
</script>
