<template>
  <div class="space-y-6 cf-surface">
    <div class="flex items-start justify-between flex-wrap gap-3 cf-header">
      <div>
        <h1 class="cf-title">Dashboard de Análisis</h1>
        <p class="cf-subtitle">Vista general y análisis detallado de tus finanzas</p>
      </div>
      <div class="flex items-center gap-2">
        <AppDatePicker v-model="selectedMonth" mode="month" aria-label="Seleccionar mes" />
      </div>
    </div>

    <!-- Métricas clave -->
    <KeyMetricsCards
      :total-spent="totalSpent"
      :remaining-budget="remainingBudget"
      :budget-progress="budgetProgress"
      :average-daily="averageDailyExpense"
      :total-fixed-expenses="totalFixedExpenses"
      :expenses-count="currentMonthExpenses.length"
      :fixed-expenses-count="fixedExpensesThisMonth.length"
    />

    <!-- Progreso del presupuesto -->
    <BudgetProgress :show-credits="true" :month="selectedMonth" />

    <!-- Gráfico de gastos por categoría -->
    <ExpensesByCategoryChart :expenses-by-category="expensesByCategoryForMonth" />

    <!-- Gráfico de gastos diarios -->
    <DailyExpensesChart 
      :daily-data="dailyExpensesDataForMonth" 
      :current-month="selectedMonth || currentMonth"
    />

    <!-- Gráfico de progreso mensual -->
    <MonthlyProgressChart 
      :daily-data="dailyExpensesDataForMonth" 
      :budget="budgetAmountForMonth"
      :current-month="selectedMonth || currentMonth"
    />

    <!-- Calendario de gastos -->
    <ExpensesCalendar 
      :daily-data="dailyExpensesDataForMonth"
      :expenses="expensesForMonth"
      :fixed-expenses="fixedExpensesForMonth"
      :monthly-budget="budgetAmountForMonth"
      :month="selectedMonth"
      @month-changed="onCalendarMonthChanged"
    />

    <!-- Categorías de gastos -->
    <div class="cf-card">
      <div class="cf-card-head">
        <h2 class="cf-card-title">Gastos por Categoría</h2>
      </div>
      
      <div v-if="expensesByCategory.length === 0" class="text-center py-8">
        <p class="cf-muted">No hay gastos registrados este mes</p>
      </div>
      
      <div v-else class="space-y-2">
        <div
          v-for="category in expensesByCategory"
          :key="category.category.id"
          class="cf-row"
        >
          <div class="flex items-center space-x-3">
            <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: category.category.color }"></div>
            <span class="cf-row-title">{{ category.category.name }}</span>
          </div>
          <div class="text-right">
            <p class="cf-row-amount">
              ${{ category.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
            </p>
            <p class="cf-row-secondary">{{ category.percentage.toFixed(1) }}%</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Estadísticas de gastos fijos -->
    <div class="cf-card">
      <div class="cf-card-head">
        <h2 class="cf-card-title">Gastos Fijos del Mes</h2>
      </div>
      
      <div v-if="fixedExpensesThisMonth.length === 0" class="text-center py-8">
        <p class="cf-muted">No hay gastos fijos este mes</p>
      </div>
      
      <div v-else class="space-y-2">
        <div
          v-for="expense in fixedExpensesThisMonth"
          :key="expense.id"
          class="cf-row cf-row-fixed"
        >
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div>
              <p class="cf-row-title">{{ expense.description }}</p>
              <div class="flex items-center space-x-2 mt-1">
                <span class="cf-chip cf-chip-blue">Fijo</span>
                <span class="cf-row-secondary">•</span>
                <span class="cf-row-secondary">Paga el día {{ getDayOfMonth(expense.fixedExpenseId) }}</span>
              </div>
            </div>
          </div>
          <span class="cf-row-amount">
            ${{ expense.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
          </span>
        </div>
        
        <div class="mt-4 pt-3 border-t border-blue-200">
          <div class="flex justify-between items-center">
            <span class="cf-row-secondary font-medium">Total gastos fijos:</span>
            <span class="cf-row-amount text-blue-700">
              ${{ totalFixedExpenses.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Resumen de gastos de crédito -->
    <div class="cf-card">
      <div class="cf-card-head">
        <h2 class="cf-card-title">Gastos de Crédito del Mes</h2>
      </div>
      
      <div v-if="creditExpensesThisMonth.length === 0" class="text-center py-8">
        <div class="text-gray-400 mb-2">
          <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <p class="cf-muted">No hay gastos de crédito este mes</p>
        <p class="text-xs text-gray-400 mt-1">Los pagos de tarjetas de crédito aparecerán aquí</p>
      </div>
      
      <div v-else class="space-y-2">
        <div
          v-for="expense in creditExpensesThisMonth"
          :key="expense.id"
          class="cf-row cf-row-credit"
        >
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div>
              <p class="cf-row-title">{{ expense.description }}</p>
              <div class="flex items-center space-x-2 mt-1">
                <span class="cf-chip cf-chip-red">Crédito</span>
                <span class="cf-row-secondary">{{ format(parseLocalDate(expense.date), 'dd/MM/yyyy') }}</span>
              </div>
            </div>
          </div>
          <div class="text-right">
            <p class="cf-row-amount">
              ${{ expense.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
            </p>
            <p class="cf-row-secondary">{{ expense.category.name }}</p>
          </div>
        </div>
        
        <!-- Total de gastos de crédito -->
        <div class="mt-4 pt-3 border-t border-red-200">
          <div class="flex justify-between items-center">
            <span class="cf-row-secondary font-medium">Total gastos de crédito:</span>
            <span class="cf-row-amount text-red-600">
              ${{ totalCreditExpenses.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
            </span>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            {{ creditExpensesThisMonth.length }} {{ creditExpensesThisMonth.length === 1 ? 'pago' : 'pagos' }} de crédito este mes
          </p>
        </div>
      </div>
    </div>

    <!-- Lista de gastos recientes -->
    <div class="cf-card">
      <div class="cf-card-head">
        <h2 class="cf-card-title">Gastos Recientes</h2>
      </div>
      
      <div v-if="recentExpenses.length === 0" class="text-center py-8">
        <p class="cf-muted">No hay gastos registrados</p>
      </div>
      
      <div v-else class="space-y-2">
        <div
          v-for="expense in recentExpenses.slice(0, 5)"
          :key="expense.id"
          :class="[
            'cf-row',
            expense.isFixed ? 'cf-row-fixed' : ''
          ]"
        >
          <div class="flex items-center space-x-3">
            <span class="cf-chip">
              {{ expense.category.name }}
            </span>
            <div>
              <div class="flex items-center space-x-2">
                <p class="cf-row-title">{{ expense.description }}</p>
                <span v-if="expense.isFixed" class="cf-chip cf-chip-blue">
                  Fijo
                </span>
              </div>
              <p class="cf-row-secondary">{{ format(parseLocalDate(expense.date), 'dd/MM/yyyy') }}</p>
            </div>
          </div>
          <span class="cf-row-amount">
            ${{ expense.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
          </span>
        </div>
      </div>
    </div>

    
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import { useExpenseStore } from '../stores/expenseStore'
import BudgetProgress from '../components/BudgetProgress.vue'
import KeyMetricsCards from '../components/charts/KeyMetricsCards.vue'
import ExpensesByCategoryChart from '../components/charts/ExpensesByCategoryChart.vue'
import DailyExpensesChart from '../components/charts/DailyExpensesChart.vue'
import MonthlyProgressChart from '../components/charts/MonthlyProgressChart.vue'
import ExpensesCalendar from '../components/charts/ExpensesCalendar.vue'
import { parseLocalDate } from '../utils/date'
import AppDatePicker from '../components/ui/AppDatePicker.vue'

const expenseStore = useExpenseStore()

const budget = computed(() => expenseStore.budget)
const totalSpent = computed(() => expenseStore.totalSpent)
const remainingBudget = computed(() => expenseStore.remainingBudget)
const budgetProgress = computed(() => expenseStore.budgetProgress)
const currentMonthExpenses = computed(() => expenseStore.currentMonthExpenses)
const fixedExpensesThisMonth = computed(() => expenseStore.fixedExpensesThisMonth)
const totalFixedExpenses = computed(() => expenseStore.totalFixedExpenses)
const averageDailyExpense = computed(() => expenseStore.averageDailyExpense)
const dailyExpensesData = computed(() => expenseStore.dailyExpensesData)
const monthlyTrendsData = computed(() => expenseStore.monthlyTrendsData)

const currentMonth = computed(() => format(new Date(), 'yyyy-MM'))
const selectedMonth = ref(currentMonth.value)

// navegación por botones eliminada: AppDatePicker controla el mes

const expensesForMonth = computed(() => {
  const month = selectedMonth.value
  return (expenseStore.expenses || []).filter(e => {
    const d = e?.date
    if (typeof d === 'string' && /^\d{4}-\d{2}/.test(d)) return d.slice(0,7) === month
    const ld = parseLocalDate(d)
    if (Number.isNaN(ld?.getTime?.())) return false
    const ym = `${ld.getFullYear()}-${String(ld.getMonth()+1).padStart(2,'0')}`
    return ym === month
  })
})

const fixedExpensesForMonth = computed(() => expensesForMonth.value.filter(e => e.isFixed))

const dailyExpensesDataForMonth = computed(() => {
  // construir matriz de días del mes seleccionado
  const [y, m] = selectedMonth.value.split('-').map(Number)
  const daysInMonth = new Date(y, m, 0).getDate()
  const byDay = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const dateStr = `${y}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    const dayTotal = expensesForMonth.value
      .filter(e => {
        const d = e?.date
        if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d === dateStr
        const ld = parseLocalDate(d)
        return format(ld, 'yyyy-MM-dd') === dateStr
      })
      .reduce((s, e) => s + (Number(e.amount) || 0), 0)
    return { date: dateStr, amount: dayTotal }
  })
  return byDay
})

const expensesByCategoryForMonth = computed(() => {
  const totals = {}
  const outflowList = expensesForMonth.value.filter(e => {
    const isCredit = !!e?.debtId
    if (!isCredit) return true
    const type = String(e?.entryType || '').toLowerCase()
    const status = String(e?.status || '').toLowerCase()
    if (type === 'payment') return status !== 'pending'
    return false
  })
  outflowList.forEach(e => {
    const id = e.categoryId
    if (!totals[id]) totals[id] = { category: e.category, amount: 0, count: 0 }
    totals[id].amount += Number(e.amount) || 0
    totals[id].count += 1
  })
  const totalSpentMonth = outflowList.reduce((s, e) => s + (Number(e.amount) || 0), 0)
  return Object.values(totals)
    .map(c => ({ ...c, percentage: totalSpentMonth > 0 ? (c.amount / totalSpentMonth) * 100 : 0 }))
    .sort((a,b) => b.amount - a.amount)
})

const budgetAmountForMonth = computed(() => {
  const map = expenseStore.budgetsByMonth || {}
  return Number(map[selectedMonth.value]) || budget.value.amount || 0
})

const onCalendarMonthChanged = (newMonth) => {
  if (typeof newMonth === 'string' && /^\d{4}-\d{2}$/.test(newMonth)) {
    selectedMonth.value = newMonth
  }
}

const recentExpenses = computed(() => {
  return [...currentMonthExpenses.value].sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date))
})

const expensesByCategory = computed(() => expenseStore.expensesByCategory)

// Gastos de crédito del mes actual
const creditExpensesThisMonth = computed(() => {
  return currentMonthExpenses.value.filter(expense => {
    // Verificar por categoría específica "Crédito"
    const categoryName = expense.category?.name?.toLowerCase() || ''
    if (categoryName === 'crédito' || categoryName === 'credito') {
      return true
    }
    
    // También verificar por descripción que contenga "cuota" (para gastos generados automáticamente)
    const description = expense.description?.toLowerCase() || ''
    if (description.includes('cuota') && (description.includes('crédito') || description.includes('credito'))) {
      return true
    }
    
    return false
  })
})

const totalCreditExpenses = computed(() => {
  return creditExpensesThisMonth.value.reduce((total, expense) => total + expense.amount, 0)
})

// Función para obtener el día del mes de un gasto fijo
const getDayOfMonth = (fixedExpenseId) => {
  const fixedExpense = expenseStore.fixedExpenses.find(fe => fe.id === fixedExpenseId)
  if (fixedExpense && fixedExpense.dayOfMonth) {
    return fixedExpense.dayOfMonth
  }
  return 'N/A'
}

//

</script>

<style scoped>
/* Card Finance pilot styles (scoped) */
.cf-surface { background: radial-gradient(1200px 600px at 100% -20%, rgba(60, 99, 255, 0.06), transparent 60%), radial-gradient(1200px 600px at -10% 110%, rgba(60, 99, 255, 0.05), transparent 60%); }
.cf-header { padding-bottom: 4px; }
.cf-title { @apply text-2xl font-bold text-gray-900; letter-spacing: -0.01em; }
.cf-subtitle { @apply text-gray-600 mt-1; }

.cf-card { @apply bg-white rounded-xl border border-gray-100 shadow-sm; box-shadow: 0 8px 24px rgba(15,23,42,0.06); overflow: hidden; }
.cf-card + .cf-card { margin-top: 1rem; }
.cf-card-head { @apply px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white; }
.cf-card-title { @apply text-base font-semibold text-gray-900; }

.cf-row { @apply flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-white; transition: transform 160ms cubic-bezier(0.22,1,0.36,1), box-shadow 160ms; box-shadow: 0 2px 10px rgba(15,23,42,0.04); }
.cf-row:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(15,23,42,0.08); }
.cf-row-fixed { @apply bg-blue-50 border-blue-200; }
.cf-row-credit { @apply bg-red-50 border-red-200; }
.cf-row-title { @apply text-sm font-medium text-gray-900; }
.cf-row-secondary { @apply text-xs text-gray-500; }
.cf-row-amount { @apply text-sm font-semibold text-gray-900; }

.cf-chip { @apply inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-gray-100 text-gray-800; }
.cf-chip-blue { @apply bg-blue-100 text-blue-800; }
.cf-chip-red { @apply bg-red-100 text-red-800; }

.cf-muted { @apply text-gray-500; }

.cf-btn-primary { @apply inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800; box-shadow: 0 10px 22px rgba(15,23,42,0.18); transition: transform 140ms cubic-bezier(0.22,1,0.36,1); }
.cf-btn-primary:active { transform: translateY(1px) scale(0.99); }

.cf-fab { @apply bg-gray-900 text-white; box-shadow: 0 16px 40px rgba(15,23,42,0.2); }
.cf-fab:hover { box-shadow: 0 20px 50px rgba(15,23,42,0.28); }
</style>
