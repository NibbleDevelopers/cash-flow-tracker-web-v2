<template>
  <div class="card p-3 sm:p-4">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-4">
      <h3 class="text-base sm:text-lg font-semibold text-gray-900">Gastos Diarios - {{ currentMonthName }}</h3>
      <div class="flex items-center space-x-2">
        <span class="text-xs sm:text-sm text-gray-500">Promedio diario: ${{ averageDaily.toFixed(2) }}</span>
      </div>
    </div>
    
    <div v-if="dailyData.length === 0" class="text-center py-6 sm:py-8">
      <div class="text-gray-400 mb-2">
        <svg class="mx-auto h-8 w-8 sm:h-12 sm:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <p class="text-sm text-gray-500">No hay gastos registrados este mes</p>
    </div>
    
    <div v-else class="overflow-x-auto">
      <apexchart
        type="bar"
        :options="chartOptions"
        :series="chartSeries"
        :height="isMobile ? 250 : 300"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

// Detectar si es mobile
const isMobile = ref(false)

const updateScreenSize = () => {
  isMobile.value = window.innerWidth < 640
}

onMounted(() => {
  updateScreenSize()
  window.addEventListener('resize', updateScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize)
})

const props = defineProps({
  dailyData: {
    type: Array,
    default: () => []
  },
  currentMonth: {
    type: String,
    default: ''
  }
})

const currentMonthName = computed(() => {
  if (!props.currentMonth) return ''
  try {
    return format(parseISO(props.currentMonth + '-01'), 'MMMM yyyy', { locale: es })
  } catch {
    return props.currentMonth
  }
})

const averageDaily = computed(() => {
  if (props.dailyData.length === 0) return 0
  const total = props.dailyData.reduce((sum, day) => sum + day.amount, 0)
  return total / props.dailyData.length
})

const chartSeries = computed(() => [
  {
    name: 'Gastos',
    data: props.dailyData.map(day => day.amount)
  }
])

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    fontFamily: 'Inter, system-ui, sans-serif',
    toolbar: {
      show: !isMobile.value,
      tools: {
        download: true,
        selection: true,
        zoom: true,
        zoomin: true,
        zoomout: true,
        pan: true,
        reset: true
      }
    },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800
    }
  },
  colors: ['#3B82F6'],
  plotOptions: {
    bar: {
      borderRadius: 4,
      columnWidth: isMobile.value ? '80%' : '60%',
      dataLabels: {
        position: 'top'
      }
    }
  },
  dataLabels: {
    enabled: false
  },
  xaxis: {
    categories: props.dailyData.map(day => {
      try {
        return format(parseISO(day.date), 'dd/MM', { locale: es })
      } catch {
        return day.date
      }
    }),
    labels: {
      style: {
        fontSize: isMobile.value ? '10px' : '11px',
        colors: '#6B7280'
      },
      rotate: isMobile.value ? -90 : -45,
      maxHeight: isMobile.value ? 40 : undefined
    }
  },
  yaxis: {
    labels: {
      formatter: function (val) {
        return '$' + val.toLocaleString('es-ES', { minimumFractionDigits: 0 })
      },
      style: {
        fontSize: isMobile.value ? '10px' : '12px',
        colors: '#6B7280'
      }
    }
  },
  tooltip: {
    y: {
      formatter: function (val) {
        return '$' + val.toLocaleString('es-ES', { minimumFractionDigits: 2 })
      }
    }
  },
  grid: {
    borderColor: '#E5E7EB',
    strokeDashArray: 4
  },
  responsive: [{
    breakpoint: 768,
    options: {
      chart: {
        height: 250
      },
      xaxis: {
        labels: {
          rotate: -90,
          style: {
            fontSize: '10px'
          }
        }
      }
    }
  }]
}))
</script>


