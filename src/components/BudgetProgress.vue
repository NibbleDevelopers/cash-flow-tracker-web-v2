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
      <div :class="gridColsClass">
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

        <!-- Cargos de crédito del periodo (solo informativo) -->
        <div v-if="showCredits" class="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
          <div class="w-10 h-10 bg-purple-400 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <p class="text-sm text-purple-700 font-medium mb-2">Cargos de crédito</p>
          <p :class="[amountTextClass, 'text-purple-900']">
            ${{ totalCreditCharges.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
          </p>
        </div>
      </div>

      <!-- Total del mes (impacta presupuesto) -->
      <div class="flex items-center justify-between text-sm text-gray-700">
        <span>Total del mes</span>
        <span class="font-semibold">
          ${{ totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
        </span>
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
import { parseLocalDate } from '../utils/date'

const props = defineProps({
  amountSize: {
    type: String,
    default: 'lg',
    validator: (value) => ['sm', 'base', 'lg', 'xl', '2xl'].includes(value)
  },
  // Mes opcional en formato 'yyyy-MM'. Si no se pasa, usa el mes actual del store
  month: {
    type: String,
    default: ''
  },
  // Mostrar tarjeta de cargos de crédito informativa
  showCredits: {
    type: Boolean,
    default: false
  }
})

const expenseStore = useExpenseStore()

// ¿Se pidió un mes específico?
const selectedMonth = computed(() => {
  const m = (props.month || '').trim()
  return /^\d{4}-\d{2}$/.test(m) ? m : ''
})

// Filtrar gastos por mes cuando se provee 'month'; si no, usar los del store
const expensesForPeriod = computed(() => {
  if (!selectedMonth.value) return expenseStore.currentMonthExpenses
  const month = selectedMonth.value
  const list = expenseStore.expenses || []
  return list.filter(e => {
    const d = e?.date
    if (typeof d === 'string' && /^\d{4}-\d{2}/.test(d)) {
      return d.slice(0, 7) === month
    }
    const ld = parseLocalDate(d)
    if (Number.isNaN(ld?.getTime?.())) return false
    const ym = `${ld.getFullYear()}-${String(ld.getMonth() + 1).padStart(2, '0')}`
    return ym === month
  })
})

// Filtrar solo egresos que impactan presupuesto:
// - Gastos normales (sin debtId)
// - Pagos de crédito (entryType==='payment') y no 'pending'
const outflowExpenses = computed(() => {
  return (expensesForPeriod.value || []).filter(e => {
    const isCredit = !!e?.debtId
    if (!isCredit) return true
    const type = String(e?.entryType || '').toLowerCase()
    const status = String(e?.status || '').toLowerCase()
    if (type === 'payment') {
      return status !== 'pending'
    }
    // Excluir cargos de crédito (compras) del presupuesto
    return false
  })
})

// Total gastado para el periodo (solo egresos reales)
const totalSpent = computed(() => {
  return outflowExpenses.value.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
})

// Presupuesto del periodo
const budgetAmount = computed(() => {
  if (!selectedMonth.value) return expenseStore.budget.amount
  const map = expenseStore.budgetsByMonth || {}
  return Number(map[selectedMonth.value]) || 0
})

// Objeto presupuesto para mantener API de la plantilla
const budget = computed(() => ({ amount: budgetAmount.value }))

// Derivados del periodo
const budgetProgress = computed(() => {
  if (budgetAmount.value === 0) return 0
  return Math.min((totalSpent.value / budgetAmount.value) * 100, 100)
})

const remainingBudget = computed(() => {
  return Math.max(budgetAmount.value - totalSpent.value, 0)
})

const isOverBudget = computed(() => {
  return budgetAmount.value > 0 && totalSpent.value > budgetAmount.value
})

// (sin cómputo extra: usamos totalSpent que ya excluye cargos de crédito)

// Total de cargos de crédito (entryType==='charge') en el periodo
const totalCreditCharges = computed(() => {
  const list = expensesForPeriod.value || []
  return list
    .filter(e => !!e?.debtId && String(e?.entryType || '').toLowerCase() === 'charge')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
})

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

// Grid responsivo: si showCredits está activo, mostrar 4 columnas en lg
const gridColsClass = computed(() => {
  return props.showCredits
    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'
    : 'grid grid-cols-1 sm:grid-cols-3 gap-4'
})
</script>
