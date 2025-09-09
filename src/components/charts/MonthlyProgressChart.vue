<template>
  <div class="card">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold text-gray-900">Progreso Mensual</h3>
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 rounded-full bg-blue-500"></div>
          <span class="text-sm text-gray-600">Gastos Acumulados</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 rounded-full bg-green-500"></div>
          <span class="text-sm text-gray-600">Presupuesto</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 rounded-full bg-orange-500"></div>
          <span class="text-sm text-gray-600">Proyección</span>
        </div>
      </div>
    </div>
    
    <div v-if="dailyData.length === 0" class="text-center py-8">
      <div class="text-gray-400 mb-2">
        <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <p class="text-gray-500">No hay gastos registrados este mes</p>
    </div>
    
    <div v-else>
      <!-- Estadísticas del progreso -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-blue-600">Gastado Hoy</p>
              <p class="text-2xl font-bold text-blue-900">
                ${{ todaySpent.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
              </p>
            </div>
            <div class="p-2 bg-blue-200 rounded-full">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
        
        <div class="bg-green-50 p-4 rounded-lg border border-green-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-green-600">Presupuesto Restante</p>
              <p class="text-2xl font-bold text-green-900">
                ${{ remainingBudget.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
              </p>
            </div>
            <div class="p-2 bg-green-200 rounded-full">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div class="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-orange-600">Proyección Final</p>
              <p class="text-2xl font-bold text-orange-900">
                ${{ projectedTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
              </p>
            </div>
            <div class="p-2 bg-orange-200 rounded-full">
              <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Gráfico principal -->
      <apexchart
        type="area"
        :options="chartOptions"
        :series="chartSeries"
        height="400"
      />
      
      <!-- Alertas y recomendaciones -->
      <div v-if="alerts.length > 0" class="mt-6 space-y-2">
        <div
          v-for="alert in alerts"
          :key="alert.type"
          :class="[
            'p-3 rounded-lg border',
            alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
          ]"
        >
          <div class="flex items-center space-x-2">
            <svg v-if="alert.type === 'warning'" class="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <span :class="[
              'text-sm font-medium',
              alert.type === 'warning' ? 'text-yellow-800' : 'text-red-800'
            ]">
              {{ alert.message }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

const props = defineProps({
  dailyData: {
    type: Array,
    default: () => []
  },
  budget: {
    type: Number,
    default: 0
  },
  currentMonth: {
    type: String,
    default: ''
  }
})

// Calcular gastos acumulados día a día
const cumulativeData = computed(() => {
  let cumulative = 0
  return props.dailyData.map(day => {
    cumulative += day.amount
    return {
      date: day.date,
      amount: cumulative
    }
  })
})

// Calcular gastos de hoy
const todaySpent = computed(() => {
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayData = props.dailyData.find(day => day.date === today)
  return todayData ? todayData.amount : 0
})

// Calcular presupuesto restante
const remainingBudget = computed(() => {
  const totalSpent = cumulativeData.value.length > 0 
    ? cumulativeData.value[cumulativeData.value.length - 1].amount 
    : 0
  return Math.max(props.budget - totalSpent, 0)
})

// Calcular proyección al final del mes
const projectedTotal = computed(() => {
  const totalSpent = cumulativeData.value.length > 0 
    ? cumulativeData.value[cumulativeData.value.length - 1].amount 
    : 0
  const currentDay = new Date().getDate()
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  
  if (currentDay === 0) return totalSpent
  
  const dailyAverage = totalSpent / currentDay
  return Math.round(dailyAverage * daysInMonth)
})

// Generar datos de presupuesto (línea horizontal)
const budgetData = computed(() => {
  return props.dailyData.map(day => props.budget)
})

// Generar datos de proyección
const projectionData = computed(() => {
  const totalSpent = cumulativeData.value.length > 0 
    ? cumulativeData.value[cumulativeData.value.length - 1].amount 
    : 0
  const currentDay = new Date().getDate()
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  
  if (currentDay === 0) return props.dailyData.map(() => 0)
  
  const dailyAverage = totalSpent / currentDay
  return props.dailyData.map((_, index) => {
    const dayNumber = index + 1
    return Math.round(dailyAverage * dayNumber)
  })
})

// Alertas y recomendaciones
const alerts = computed(() => {
  const alerts = []
  const totalSpent = cumulativeData.value.length > 0 
    ? cumulativeData.value[cumulativeData.value.length - 1].amount 
    : 0
  const budgetProgress = props.budget > 0 ? (totalSpent / props.budget) * 100 : 0
  
  if (budgetProgress > 90) {
    alerts.push({
      type: 'danger',
      message: `¡Alerta! Has gastado el ${budgetProgress.toFixed(1)}% de tu presupuesto.`
    })
  } else if (budgetProgress > 75) {
    alerts.push({
      type: 'warning',
      message: `Cuidado: Has gastado el ${budgetProgress.toFixed(1)}% de tu presupuesto.`
    })
  }
  
  if (projectedTotal.value > props.budget) {
    alerts.push({
      type: 'warning',
      message: `Proyección: Al ritmo actual gastarás $${(projectedTotal.value - props.budget).toLocaleString('es-ES', { minimumFractionDigits: 2 })} más que tu presupuesto.`
    })
  }
  
  return alerts
})

const chartSeries = computed(() => [
  {
    name: 'Gastos Acumulados',
    data: cumulativeData.value.map(item => item.amount)
  },
  {
    name: 'Presupuesto',
    data: budgetData.value
  },
  {
    name: 'Proyección',
    data: projectionData.value
  }
])

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    fontFamily: 'Inter, system-ui, sans-serif',
    toolbar: {
      show: true,
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
  colors: ['#3B82F6', '#10B981', '#F59E0B'],
  stroke: {
    curve: 'smooth',
    width: [3, 2, 2]
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.3,
      stops: [0, 100]
    }
  },
  markers: {
    size: [4, 0, 0],
    hover: {
      size: 6
    }
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
        fontSize: '12px',
        colors: '#6B7280'
      }
    }
  },
  yaxis: {
    labels: {
      formatter: function (val) {
        return '$' + val.toLocaleString('es-ES', { minimumFractionDigits: 0 })
      },
      style: {
        fontSize: '12px',
        colors: '#6B7280'
      }
    }
  },
  tooltip: {
    shared: true,
    intersect: false,
    y: {
      formatter: function (val) {
        return '$' + val.toLocaleString('es-ES', { minimumFractionDigits: 2 })
      }
    }
  },
  legend: {
    show: false
  },
  grid: {
    borderColor: '#E5E7EB',
    strokeDashArray: 4
  },
  responsive: [{
    breakpoint: 768,
    options: {
      chart: {
        height: 300
      },
      xaxis: {
        labels: {
          rotate: -45
        }
      }
    }
  }]
}))
</script>







