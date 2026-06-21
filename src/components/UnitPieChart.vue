<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import {
  Chart,
  PieController,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'

Chart.register(PieController, ArcElement, Tooltip, Legend)

const props = defineProps<{
  pendingCount: number
  approvedCount: number
  rejectedCount: number
}>()

const chartRef = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const chartData = computed(() => ({
  labels: ['待审核', '已审核', '已驳回'],
  datasets: [
    {
      data: [props.pendingCount, props.approvedCount, props.rejectedCount],
      backgroundColor: [
        'rgba(251, 191, 36, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
      borderColor: [
        'rgba(251, 191, 36, 1)',
        'rgba(34, 197, 94, 1)',
        'rgba(239, 68, 68, 1)',
      ],
      borderWidth: 2,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 20,
        font: { size: 12 },
        usePointStyle: true,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: { size: 14 },
      bodyFont: { size: 13 },
      callbacks: {
        label: function(context: any) {
          const total = props.pendingCount + props.approvedCount + props.rejectedCount
          const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0
          return `${context.label}: ${context.parsed} (${percentage}%)`
        }
      }
    }
  },
}

onMounted(() => {
  if (chartRef.value) {
    chartInstance = new Chart(chartRef.value, {
      type: 'pie',
      data: chartData.value,
      options: chartOptions,
    })
  }
})

watch(chartData, (newData) => {
  if (chartInstance) {
    chartInstance.data = newData
    chartInstance.update()
  }
}, { deep: true })
</script>

<template>
  <div class="h-full">
    <canvas ref="chartRef"></canvas>
  </div>
</template>
