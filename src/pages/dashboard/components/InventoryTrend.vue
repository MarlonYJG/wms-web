<!--
 * @Author: Marlon
 * @Date: 2025-10-06 21:34:58
 * @Description:
-->
<script lang="ts" setup>
import { LineChart } from "echarts/charts"
import { GridComponent, LegendComponent, TooltipComponent } from "echarts/components"
import * as echarts from "echarts/core"
import { CanvasRenderer } from "echarts/renderers"
import { onBeforeUnmount, onMounted, ref, watch } from "vue"

const props = defineProps<{
  dates: string[]
  inbound: number[]
  outbound: number[]
}>()

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

const chartRef = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null

function render() {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  chart.setOption({
    tooltip: { trigger: "axis" },
    legend: { data: ["入库", "出库"] },
    grid: { left: 24, right: 16, top: 32, bottom: 24, containLabel: true },
    xAxis: { type: "category", data: props.dates },
    yAxis: { type: "value" },
    series: [
      { name: "入库", type: "line", smooth: true, data: props.inbound },
      { name: "出库", type: "line", smooth: true, data: props.outbound }
    ]
  })
}

onMounted(() => {
  render()
  window.addEventListener("resize", () => chart?.resize())
})

onBeforeUnmount(() => {
  chart?.dispose()
})

watch(() => [props.dates, props.inbound, props.outbound], () => {
  chart?.dispose()
  render()
})
</script>

<template>
  <div ref="chartRef" class="chart" />
</template>

<style scoped>
.chart {
  width: 100%;
  height: 260px;
}
</style>
