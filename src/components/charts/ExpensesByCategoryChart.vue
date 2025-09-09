<template>
  <div class="card">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold text-gray-900">Gastos por Categoría</h3>
      <div class="flex items-center space-x-2">
        <span class="text-sm text-gray-500">Total: ${{ totalAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}</span>
      </div>
    </div>
    
    <div v-if="expensesByCategory.length === 0" class="text-center py-8">
      <div class="text-gray-400 mb-2">
        <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <p class="text-gray-500">No hay gastos registrados este mes</p>
    </div>
    
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Gráfico Donut -->
      <div class="flex justify-center">
        <apexchart
          type="donut"
          :options="chartOptions"
          :series="chartSeries"
          height="300"
        />
      </div>
      
      <!-- Leyenda -->
      <div class="space-y-3">
        <div
          v-for="(category, index) in expensesByCategory"
          :key="category.category.id"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <div 
              class="w-4 h-4 rounded-full" 
              :style="{ backgroundColor: category.category.color }"
            ></div>
            <span class="text-sm font-medium text-gray-900">{{ category.category.name }}</span>
          </div>
          <div class="text-right">
            <p class="text-sm font-semibold text-gray-900">
              ${{ category.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
            </p>
            <p class="text-xs text-gray-500">{{ category.percentage.toFixed(1) }}%</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const props = defineProps({
  expensesByCategory: {
    type: Array,
    default: () => []
  }
})

const totalAmount = computed(() => {
  return props.expensesByCategory.reduce((sum, category) => sum + category.amount, 0)
})

const chartSeries = computed(() => {
  return props.expensesByCategory.map(category => category.amount)
})

const chartOptions = computed(() => ({
  chart: {
    type: 'donut',
    fontFamily: 'Inter, system-ui, sans-serif',
    toolbar: {
      show: false
    }
  },
  labels: props.expensesByCategory.map(category => category.category.name),
  colors: props.expensesByCategory.map(category => category.category.color),
  dataLabels: {
    enabled: true,
    formatter: function (val) {
      return val.toFixed(1) + "%"
    },
    style: {
      fontSize: '12px',
      fontWeight: '600',
      colors: ['#fff']
    }
  },
  plotOptions: {
    pie: {
      donut: {
        size: '70%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total',
            formatter: function () {
              return '$' + totalAmount.value.toLocaleString('es-ES', { minimumFractionDigits: 2 })
            },
            fontSize: '16px',
            fontWeight: '600',
            color: '#374151'
          }
        }
      }
    }
  },
  legend: {
    show: false
  },
  tooltip: {
    y: {
      formatter: function (val) {
        return '$' + val.toLocaleString('es-ES', { minimumFractionDigits: 2 })
      }
    }
  },
  responsive: [{
    breakpoint: 768,
    options: {
      chart: {
        height: 250
      }
    }
  }]
}))
</script>


