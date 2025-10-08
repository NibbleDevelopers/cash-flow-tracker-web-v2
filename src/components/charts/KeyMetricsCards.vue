<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
    <!-- Total Gastos -->
    <div class="card bg-gradient-to-br from-red-50 to-red-100 border-red-200 p-3 sm:p-4">
      <div class="flex items-center justify-between">
        <div class="flex-1 min-w-0">
          <p class="text-xs sm:text-sm font-medium text-red-600 truncate">Total Gastos</p>
          <p class="text-lg sm:text-2xl font-bold text-red-900 truncate">
            ${{ totalSpent.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
          </p>
          <p class="text-xs text-red-600 mt-1 truncate">{{ expensesCount }} transacciones</p>
        </div>
        <div class="p-2 sm:p-3 bg-red-200 rounded-full flex-shrink-0">
          <svg class="w-4 h-4 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Presupuesto Restante -->
    <div class="card bg-gradient-to-br from-green-50 to-green-100 border-green-200 p-3 sm:p-4">
      <div class="flex items-center justify-between">
        <div class="flex-1 min-w-0">
          <p class="text-xs sm:text-sm font-medium text-green-600 truncate">Presupuesto Restante</p>
          <p class="text-lg sm:text-2xl font-bold text-green-900 truncate">
            ${{ remainingBudget.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
          </p>
          <p class="text-xs text-green-600 mt-1 truncate">{{ budgetProgress.toFixed(1) }}% utilizado</p>
        </div>
        <div class="p-2 sm:p-3 bg-green-200 rounded-full flex-shrink-0">
          <svg class="w-4 h-4 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Promedio Diario -->
    <div class="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 p-3 sm:p-4">
      <div class="flex items-center justify-between">
        <div class="flex-1 min-w-0">
          <p class="text-xs sm:text-sm font-medium text-blue-600 truncate">Promedio Diario</p>
          <p class="text-lg sm:text-2xl font-bold text-blue-900 truncate">
            ${{ averageDaily.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
          </p>
          <p class="text-xs text-blue-600 mt-1 truncate">Este mes</p>
        </div>
        <div class="p-2 sm:p-3 bg-blue-200 rounded-full flex-shrink-0">
          <svg class="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Gastos Fijos -->
    <div class="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 p-3 sm:p-4">
      <div class="flex items-center justify-between">
        <div class="flex-1 min-w-0">
          <p class="text-xs sm:text-sm font-medium text-purple-600 truncate">Gastos Fijos</p>
          <p class="text-lg sm:text-2xl font-bold text-purple-900 truncate">
            ${{ totalFixedExpenses.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
          </p>
          <p class="text-xs text-purple-600 mt-1 truncate">{{ fixedExpensesCount }} gastos</p>
        </div>
        <div class="p-2 sm:p-3 bg-purple-200 rounded-full flex-shrink-0">
          <svg class="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  totalSpent: {
    type: Number,
    default: 0
  },
  remainingBudget: {
    type: Number,
    default: 0
  },
  budgetProgress: {
    type: Number,
    default: 0
  },
  averageDaily: {
    type: Number,
    default: 0
  },
  totalFixedExpenses: {
    type: Number,
    default: 0
  },
  expensesCount: {
    type: Number,
    default: 0
  },
  fixedExpensesCount: {
    type: Number,
    default: 0
  }
})
</script>


