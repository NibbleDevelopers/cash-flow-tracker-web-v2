<template>
  <div class="card">
    <h2 class="text-lg font-semibold text-gray-900 mb-4">Progreso del Presupuesto</h2>
    
    <div class="space-y-4">
      <!-- Barra de progreso -->
      <div>
        <div class="flex justify-between text-sm text-gray-600 mb-2">
          <span>Gastado</span>
          <span>{{ budgetProgress.toFixed(1) }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3">
          <div
            class="h-3 rounded-full transition-all duration-300"
            :class="progressBarClass"
            :style="{ width: `${Math.min(budgetProgress, 100)}%` }"
          ></div>
        </div>
      </div>

      <!-- Información del presupuesto -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div class="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p class="text-sm text-blue-700 font-medium mb-2">Presupuesto</p>
          <p :class="[amountTextClass, 'text-blue-900']">
            ${{ budget.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
          </p>
        </div>
        
        <div class="text-center p-4 bg-orange-50 rounded-lg border border-orange-100">
          <div class="w-10 h-10 bg-orange-400 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <p class="text-sm text-orange-700 font-medium mb-2">Gastado</p>
          <p :class="[amountTextClass, totalSpent > budget.amount ? 'text-red-600' : 'text-orange-900']">
            ${{ totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
          </p>
        </div>
        
        <div class="text-center p-4 bg-green-50 rounded-lg border border-green-100">
          <div class="w-10 h-10 bg-green-400 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <p class="text-sm text-green-700 font-medium mb-2">Restante</p>
          <p :class="[amountTextClass, remainingBudget > 0 ? 'text-green-600' : 'text-red-600']">
            ${{ remainingBudget.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
          </p>
        </div>
      </div>

      <!-- Alerta si se excede el presupuesto -->
      <div v-if="isOverBudget" class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-center">
          <svg class="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <p class="text-sm text-red-600">
            Has excedido tu presupuesto mensual por 
            ${{ (totalSpent - budget.amount).toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useExpenseStore } from '../stores/expenseStore'

const props = defineProps({
  amountSize: {
    type: String,
    default: 'lg',
    validator: (value) => ['sm', 'base', 'lg', 'xl', '2xl'].includes(value)
  }
})

const expenseStore = useExpenseStore()

const budget = computed(() => expenseStore.budget)
const totalSpent = computed(() => expenseStore.totalSpent)
const budgetProgress = computed(() => expenseStore.budgetProgress)
const remainingBudget = computed(() => expenseStore.remainingBudget)
const isOverBudget = computed(() => expenseStore.isOverBudget)

const progressBarClass = computed(() => {
  if (budgetProgress.value >= 100) return 'bg-red-500'
  if (budgetProgress.value >= 80) return 'bg-yellow-500'
  return 'bg-green-500'
})

const amountTextClass = computed(() => {
  const sizeMap = {
    sm: 'text-sm',
    base: 'text-base', 
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl'
  }
  return `font-bold break-all ${sizeMap[props.amountSize]}`
})
</script>
