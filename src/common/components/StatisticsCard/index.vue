<script lang="ts" setup>
import { ElCard, ElStatistic } from "element-plus"

interface Props {
  title: string
  value: number | string
  suffix?: string
  prefix?: string
  precision?: number
  color?: string
  icon?: string
  trend?: {
    value: number
    type: 'up' | 'down' | 'stable'
  }
}

const props = withDefaults(defineProps<Props>(), {
  precision: 0,
  color: '#409EFF'
})

// 获取趋势图标
const getTrendIcon = () => {
  if (!props.trend) return ''
  
  const iconMap = {
    up: '↗',
    down: '↘',
    stable: '→'
  }
  return iconMap[props.trend.type]
}

// 获取趋势颜色
const getTrendColor = () => {
  if (!props.trend) return '#909399'
  
  const colorMap = {
    up: '#67C23A',
    down: '#F56C6C',
    stable: '#909399'
  }
  return colorMap[props.trend.type]
}
</script>

<template>
  <el-card class="statistics-card" shadow="hover">
    <div class="card-content">
      <div class="card-header">
        <div class="title">{{ title }}</div>
        <div v-if="icon" class="icon" :style="{ color }">
          <i :class="icon"></i>
        </div>
      </div>
      
      <div class="card-body">
        <el-statistic
          :value="value"
          :suffix="suffix"
          :prefix="prefix"
          :precision="precision"
          :value-style="{ color, fontSize: '24px', fontWeight: 'bold' }"
        />
        
        <div v-if="trend" class="trend">
          <span :style="{ color: getTrendColor() }">
            {{ getTrendIcon() }} {{ Math.abs(trend.value) }}%
          </span>
          <span class="trend-text">较昨日</span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
.statistics-card {
  .card-content {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      
      .title {
        font-size: 14px;
        color: #606266;
        font-weight: 500;
      }
      
      .icon {
        font-size: 20px;
      }
    }
    
    .card-body {
      .trend {
        margin-top: 8px;
        font-size: 12px;
        
        .trend-text {
          color: #909399;
          margin-left: 4px;
        }
      }
    }
  }
}
</style>
