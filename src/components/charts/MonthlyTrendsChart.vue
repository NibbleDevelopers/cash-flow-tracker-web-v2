<template>
  <div class="card">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold text-gray-900">Tendencias Mensuales</h3>
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 rounded-full bg-primary-500"></div>
          <span class="text-sm text-gray-600">Gastos</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 rounded-full bg-green-500"></div>
          <span class="text-sm text-gray-600">Presupuesto</span>
        </div>
      </div>
    </div>
    
    <div v-if="monthlyData.length === 0" class="text-center py-8">
      <div class="text-gray-400 mb-2">
        <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <p class="text-gray-500">No hay datos suficientes para mostrar tendencias</p>
    </div>
    
    <div v-else>
      <apexchart
        type="line"
        :options="chartOptions"
        :series="chartSeries"
        height="350"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

const props = defineProps({
  monthlyData: {
    type: Array,
    default: () => []
  }
})

const chartSeries = computed(() => [
  {
    name: 'Gastos',
    data: props.monthlyData.map(item => item.expenses)
  },
  {
    name: 'Presupuesto',
    data: props.monthlyData.map(item => item.budget)
  }
])

const chartOptions = computed(() => ({
  chart: {
    type: 'line',
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
  colors: ['#3B82F6', '#10B981'],
  stroke: {
    curve: 'smooth',
    width: [3, 2]
  },
  markers: {
    size: [6, 4],
    hover: {
      size: 8
    }
  },
  xaxis: {
    categories: props.monthlyData.map(item => {
      try {
        return format(parseISO(item.month + '-01'), 'MMM yyyy', { locale: es })
      } catch {
        return item.month
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
        height: 250
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


