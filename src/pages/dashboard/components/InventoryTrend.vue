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
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#e2e8f0",
      borderWidth: 1,
      textStyle: {
        color: "#1e293b",
        fontSize: 14
      },
      axisPointer: {
        type: "cross",
        crossStyle: {
          color: "#3b82f6"
        }
      }
    },
    legend: {
      data: ["入库", "出库"],
      top: 0,
      textStyle: {
        color: "#64748b",
        fontSize: 14,
        fontWeight: 500
      },
      itemGap: 20
    },
    grid: {
      left: 40,
      right: 40,
      top: 50,
      bottom: 40,
      containLabel: true
    },
    xAxis: {
      type: "category",
      data: props.dates,
      axisLine: {
        lineStyle: {
          color: "#e2e8f0"
        }
      },
      axisTick: {
        lineStyle: {
          color: "#e2e8f0"
        }
      },
      axisLabel: {
        color: "#64748b",
        fontSize: 12
      }
    },
    yAxis: {
      type: "value",
      axisLine: {
        lineStyle: {
          color: "#e2e8f0"
        }
      },
      axisTick: {
        lineStyle: {
          color: "#e2e8f0"
        }
      },
      axisLabel: {
        color: "#64748b",
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          color: "#f1f5f9",
          type: "dashed"
        }
      }
    },
    series: [
      {
        name: "入库",
        type: "line",
        smooth: true,
        data: props.inbound,
        lineStyle: {
          color: "#10b981",
          width: 3
        },
        itemStyle: {
          color: "#10b981",
          borderWidth: 2,
          borderColor: "#ffffff"
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(16, 185, 129, 0.3)" },
              { offset: 1, color: "rgba(16, 185, 129, 0.05)" }
            ]
          }
        },
        symbol: "circle",
        symbolSize: 6
      },
      {
        name: "出库",
        type: "line",
        smooth: true,
        data: props.outbound,
        lineStyle: {
          color: "#3b82f6",
          width: 3
        },
        itemStyle: {
          color: "#3b82f6",
          borderWidth: 2,
          borderColor: "#ffffff"
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(59, 130, 246, 0.3)" },
              { offset: 1, color: "rgba(59, 130, 246, 0.05)" }
            ]
          }
        },
        symbol: "circle",
        symbolSize: 6
      }
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
  height: 240px;
  background: transparent;
}
</style>
