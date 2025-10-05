<template>
  <div
    :class="[
      'flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl border transition hover:shadow-sm',
      expense.isFixed ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
    ]"
  >
    <div class="flex-1 min-w-0">
      <div class="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
        <div class="flex-shrink-0">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
            {{ expense.category.name }}
          </span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
            <h3 class="text-sm font-medium text-gray-900 truncate">{{ expense.description }}</h3>
            <span v-if="expense.isFixed" class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wide">Fijo</span>
            <span v-if="isCreditPayment(expense)" class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-600 text-white uppercase tracking-wide">
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
              Crédito
            </span>
            <span
              v-if="expense.entryType === 'payment'"
              class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide"
            >
              Abono
            </span>
            <span
              v-else-if="expense.entryType === 'charge'"
              class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wide"
            >
              Cargo
            </span>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-1">
            <p class="text-xs text-gray-500">{{ format(parseLocalDate(expense.date), 'dd/MM/yyyy') }}</p>
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
    <div class="text-right mt-3 sm:mt-0">
      <p class="text-sm font-semibold text-gray-900">
        ${{ (expense?.amount || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
      </p>
      <div class="mt-2 flex justify-end gap-2">
        <button
          class="p-1.5 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-primary-700"
          title="Editar"
          @click.stop="$emit('edit', expense)"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5h2m-6 14h10a2 2 0 002-2v-5.586a1 1 0 00-.293-.707l-6.414-6.414A1 1 0 0011.586 4H6a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
        </button>
        <button
          class="p-1.5 rounded-md border border-gray-200 bg-white text-red-600 hover:bg-red-50"
          title="Eliminar"
          @click.stop="$emit('delete', expense)"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0V5a2 2 0 012-2h2a2 2 0 012 2v2"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useExpenseStore } from '../stores/expenseStore'

// Props
defineProps({
  expense: {
    type: Object,
    required: true
  }
})

// Emits
defineEmits(['edit', 'delete'])

// Store
const expenseStore = useExpenseStore()

// Methods
const parseLocalDate = (dateString) => {
  if (!dateString) return new Date()
  return new Date(dateString + 'T00:00:00')
}

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

// Identificar gasto de crédito (nuevo criterio: por debtId)
const isCreditPayment = (expense) => {
  if (expense?.debtId) return true
  // Backward compatibility por si hay datos antiguos en memoria
  const categoryName = expense.category?.name?.toLowerCase() || ''
  if (categoryName === 'crédito' || categoryName === 'credito') return true
  const description = expense.description?.toLowerCase() || ''
  if (description.includes('crédito') || description.includes('credito')) return true
  return false
}
</script>
