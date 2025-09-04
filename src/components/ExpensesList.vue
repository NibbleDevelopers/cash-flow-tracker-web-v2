<template>
  <div class="card">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-lg font-semibold text-gray-900">
        Gastos del Mes Actual
      </h2>
      <div class="text-sm text-gray-500">
        {{ format(new Date(), 'MMMM yyyy', { locale: es }) }}
      </div>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      <p class="mt-2 text-gray-500">Cargando gastos...</p>
    </div>

    <div v-else-if="currentMonthExpenses.length === 0" class="text-center py-8">
      <div class="text-gray-400 mb-2">
        <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p class="text-gray-500">No hay gastos registrados este mes</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="expense in currentMonthExpenses"
        :key="expense.id"
        :class="[
          'flex items-center justify-between p-4 rounded-lg border',
          expense.isFixed 
            ? 'bg-blue-50 border-blue-200 shadow-sm' 
            : 'bg-gray-50 border-gray-200'
        ]"
      >
        <div class="flex-1">
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {{ expense.category.name }}
              </span>
            </div>
            <div class="flex-1">
              <div class="flex items-center space-x-2">
                <h3 class="text-sm font-medium text-gray-900">{{ expense.description }}</h3>
                <!-- Label prominente de gasto fijo -->
                <div v-if="expense.isFixed" class="flex items-center space-x-2">
                  <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-blue-600 text-white uppercase tracking-wide">
                    FIX
                  </span>
                  <span class="text-xs font-medium text-blue-600">Fijo</span>
                </div>
              </div>
              <div class="flex items-center space-x-4 mt-1">
                <p class="text-sm text-gray-500">{{ format(new Date(expense.date), 'dd/MM/yyyy') }}</p>
                                 <!-- Mostrar día de pago para gastos fijos -->
                 <div v-if="expense.isFixed && expense.fixedExpenseId" class="flex items-center space-x-1">
                   <svg class="h-3 w-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                     <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                   </svg>
                   <span class="text-xs text-blue-600">Paga el {{ getDayOfMonth(expense.fixedExpenseId) }}</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
        <div class="text-right">
          <p class="text-sm font-semibold text-gray-900">
            ${{ expense.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
          </p>
        </div>
      </div>
    </div>

    <div v-if="currentMonthExpenses.length > 0" class="mt-6 pt-4 border-t border-gray-200">
      <div class="flex justify-between items-center">
        <span class="text-sm font-medium text-gray-700">Total del mes:</span>
        <span class="text-lg font-bold text-gray-900">
          ${{ totalSpent.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useExpenseStore } from '../stores/expenseStore'

const expenseStore = useExpenseStore()

const currentMonthExpenses = computed(() => expenseStore.currentMonthExpenses)
const totalSpent = computed(() => expenseStore.totalSpent)
const loading = computed(() => expenseStore.loading)

// Cargar gastos fijos cuando se monta el componente
onMounted(async () => {
  await expenseStore.loadFixedExpenses()
})

// Función para obtener el día del mes de un gasto fijo
const getDayOfMonth = (fixedExpenseId) => {
  // Intentar encontrar con comparación estricta
  let fixedExpense = expenseStore.fixedExpenses.find(fe => fe.id === fixedExpenseId)
  
  // Si no se encuentra, intentar con conversión de tipos
  if (!fixedExpense) {
    fixedExpense = expenseStore.fixedExpenses.find(fe => 
      fe.id == fixedExpenseId || 
      fe.id.toString() === fixedExpenseId || 
      fe.id === parseInt(fixedExpenseId)
    )
  }
  
  if (!fixedExpense) {
    return 'N/A'
  }
  
  // Crear una fecha para el día específico del mes actual
  const currentDate = new Date()
  const dayOfMonth = parseInt(fixedExpense.dayOfMonth)
  
  // Crear fecha con el día específico del mes actual
  const paymentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayOfMonth)
  
  // Formatear la fecha en español
  return format(paymentDate, 'EEEE d \'de\' MMMM', { locale: es })
}
</script>
