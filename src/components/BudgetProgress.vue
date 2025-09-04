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
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <p class="text-sm text-gray-600">Presupuesto</p>
          <p class="text-lg font-semibold text-gray-900">
            ${{ budget.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
          </p>
        </div>
        
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <p class="text-sm text-gray-600">Gastado</p>
          <p class="text-lg font-semibold" :class="totalSpent > budget.amount ? 'text-red-600' : 'text-gray-900'">
            ${{ totalSpent.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
          </p>
        </div>
        
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <p class="text-sm text-gray-600">Restante</p>
          <p class="text-lg font-semibold" :class="remainingBudget > 0 ? 'text-green-600' : 'text-red-600'">
            ${{ remainingBudget.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
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
</script>
