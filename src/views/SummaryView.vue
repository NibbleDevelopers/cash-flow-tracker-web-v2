<template>
  <div class="space-y-4 sm:space-y-6 cf-surface">
    <!-- Header Responsivo -->
    <div class="cf-header">
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div class="flex-1 min-w-0">
          <h1 class="cf-title text-xl sm:text-2xl">Dashboard de Análisis</h1>
          <p class="cf-subtitle text-sm sm:text-base">Vista general y análisis detallado de tus finanzas</p>
          
          <!-- Badges responsivos -->
          <div class="flex flex-wrap items-center gap-2 mt-3">
            <span
              class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700"
              v-motion
              :initial="{ opacity: 0, y: -4 }"
              :enter="{ opacity: 1, y: 0, transition: { duration: 0.2 } }"
            >
              {{ formattedMonthLabel }}
            </span>
            <span
              class="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700"
              v-motion
              :initial="{ opacity: 0, y: -4 }"
              :enter="{ opacity: 1, y: 0, transition: { duration: 0.2, delay: 0.03 } }"
            >
              {{ currentMonthExpenses.length }} gastos
            </span>
            <span
              class="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold"
              :class="budgetProgressBadgeClass"
              v-motion
              :initial="{ opacity: 0, y: -4 }"
              :enter="{ opacity: 1, y: 0, transition: { duration: 0.2, delay: 0.06 } }"
            >
              {{ Math.round(budgetProgress) }}%
            </span>
          </div>
        </div>
        
        <!-- Selector de mes -->
        <div class="flex items-center gap-2 sm:flex-shrink-0">
          <AppDatePicker v-model="selectedMonth" mode="month" aria-label="Seleccionar mes" />
        </div>
      </div>
    </div>

    <!-- Métricas clave -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div v-if="!isLoading">
        <KeyMetricsCards
          :total-spent="totalSpent"
          :remaining-budget="remainingBudget"
          :budget-progress="budgetProgress"
          :average-daily="averageDailyExpense"
          :total-fixed-expenses="totalFixedExpenses"
          :expenses-count="currentMonthExpenses.length"
          :fixed-expenses-count="fixedExpensesThisMonth.length"
        />
      </div>
      <LoadingSkeleton v-else type="metrics" />
    </Transition>

    <!-- Progreso del presupuesto -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div v-if="!isLoading">
        <BudgetProgress :show-credits="true" :month="selectedMonth" />
      </div>
      <div v-else class="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
    </Transition>

    <!-- Sección: Análisis Visual -->
    <div class="space-y-6">
      <div class="flex items-center space-x-3">
        <div class="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
        <h2 class="text-lg sm:text-xl font-bold text-gray-900">Análisis Visual</h2>
      </div>

    <!-- Gráfico de gastos por categoría -->
      <Transition
        enter-active-class="transition-all duration-400 ease-out"
        enter-from-class="opacity-0 translate-y-3"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-3"
      >
        <div v-if="!isLoading">
          <ExpensesByCategoryChart 
            :key="`category-chart-${selectedMonth}`"
            :expenses-by-category="expensesByCategoryForMonth" 
          />
        </div>
        <LoadingSkeleton v-else type="chart" />
      </Transition>

    <!-- Gráfico de gastos diarios -->
      <Transition
        enter-active-class="transition-all duration-400 ease-out"
        enter-from-class="opacity-0 translate-y-3"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-3"
      >
        <div v-if="!isLoading">
          <DailyExpensesChart 
            :key="`daily-chart-${selectedMonth}`"
            :daily-data="dailyExpensesDataForMonth" 
            :current-month="selectedMonth || currentMonth"
          />
        </div>
        <LoadingSkeleton v-else type="chart" />
      </Transition>

    <!-- Calendario de gastos -->
      <Transition
        enter-active-class="transition-all duration-400 ease-out"
        enter-from-class="opacity-0 translate-y-3"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-3"
      >
        <div v-if="!isLoading">
          <ExpensesCalendar 
            :key="`calendar-${selectedMonth}`"
            :daily-data="dailyExpensesDataForMonth"
            :expenses="expensesForMonth"
            :fixed-expenses="fixedExpensesForMonth"
            :monthly-budget="budgetAmountForMonth"
            :month="selectedMonth"
            @month-changed="onCalendarMonthChanged"
          />
        </div>
        <LoadingSkeleton v-else type="calendar" />
      </Transition>
    </div>

    <!-- Sección: Detalles por Categoría -->
    <div class="space-y-6">
      <div class="flex items-center space-x-3">
        <div class="w-1 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
        <h2 class="text-lg sm:text-xl font-bold text-gray-900">Detalles por Categoría</h2>
      </div>

    <!-- Categorías de gastos -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-2"
      >
        <div v-if="!isLoading" class="cf-card">
          <div class="cf-card-head px-4 sm:px-5 py-3 sm:py-4">
            <h3 class="cf-card-title text-sm sm:text-base">Gastos por Categoría</h3>
          </div>
      
          <div v-if="expensesByCategory.length === 0" class="text-center py-6 sm:py-8 px-4">
            <p class="cf-muted text-sm">No hay gastos registrados este mes</p>
          </div>
          
          <div v-else class="space-y-2 p-3 sm:p-4">
        <TransitionGroup
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 translate-x-4 scale-95"
          enter-to-class="opacity-100 translate-x-0 scale-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 translate-x-0 scale-100"
          leave-to-class="opacity-0 translate-x-4 scale-95"
        >
          <div
            v-for="(category, i) in expensesByCategory"
            :key="category.category.id"
            class="cf-row p-2 sm:p-3"
            :style="{ transitionDelay: `${i * 50}ms` }"
          >
          <div class="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <div class="w-3 h-3 rounded-full flex-shrink-0" :style="{ backgroundColor: category.category.color }"></div>
            <span class="cf-row-title text-xs sm:text-sm truncate">{{ category.category.name }}</span>
          </div>
            <div class="text-right flex-shrink-0">
              <p class="cf-row-amount text-xs sm:text-sm">
              ${{ category.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
            </p>
              <p class="cf-row-secondary text-[10px] sm:text-xs">{{ category.percentage.toFixed(1) }}%</p>
            </div>
          </div>
          </TransitionGroup>
          </div>
        </div>
        <div v-else class="cf-card h-32 bg-gray-100 animate-pulse rounded-xl"></div>
      </Transition>

    <!-- Estadísticas de gastos fijos -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div v-if="!isLoading" class="cf-card">
        <div class="cf-card-head px-4 sm:px-5 py-3 sm:py-4">
          <h3 class="cf-card-title text-sm sm:text-base">Gastos Fijos del Mes</h3>
        </div>
      
        <div v-if="fixedExpensesThisMonth.length === 0" class="text-center py-6 sm:py-8 px-4">
          <p class="cf-muted text-sm">No hay gastos fijos este mes</p>
        </div>
        
        <div v-else class="p-4">
      <div
        v-for="(expense, i) in fixedExpensesThisMonth"
          :key="expense.id"
        class="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100 mb-2"
        >
          <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
            <div class="font-medium text-gray-900">{{ expense.description }}</div>
            <div class="text-xs text-gray-500">Fijo • Día {{ getDayOfMonth(expense.fixedExpenseId) }}</div>
          </div>
        </div>
        <div class="text-right">
          <div class="font-semibold text-gray-900">
            ${{ expense.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
          </div>
        </div>
        </div>
        
      <div class="flex items-center justify-between pt-3 mt-3 border-t border-gray-200">
        <span class="font-medium text-gray-700">Total gastos fijos:</span>
        <span class="font-bold text-lg text-gray-900">
              ${{ totalFixedExpenses.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
            </span>
        </div>
        </div>
      </div>
      <div v-else class="cf-card h-32 bg-gray-100 animate-pulse rounded-xl"></div>
    </Transition>

    <!-- Resumen de gastos de crédito -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div v-if="!isLoading" class="cf-card">
        <div class="cf-card-head px-4 sm:px-5 py-3 sm:py-4">
          <h3 class="cf-card-title text-sm sm:text-base">Gastos de Crédito del Mes</h3>
        </div>
    
        <div v-if="creditExpensesThisMonth.length === 0" class="text-center py-6 sm:py-8 px-4">
          <div class="text-gray-400 mb-2">
            <svg class="mx-auto h-8 w-8 sm:h-12 sm:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <p class="cf-muted text-sm">No hay gastos de crédito este mes</p>
          <p class="text-xs text-gray-400 mt-1">Los pagos de tarjetas de crédito aparecerán aquí</p>
        </div>
        
        <div v-else class="p-4">
      <div
        v-for="(expense, i) in creditExpensesThisMonth"
        :key="expense.id"
        class="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100 mb-2"
      >
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <div class="font-medium text-gray-900">{{ expense.description }}</div>
            <div class="text-xs text-gray-500">Crédito • {{ format(parseLocalDate(expense.date), 'dd/MM/yyyy') }}</div>
          </div>
        </div>
        <div class="text-right">
          <div class="font-semibold text-gray-900">
            ${{ expense.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
          </div>
          <div class="text-xs text-gray-500">{{ expense.category.name }}</div>
        </div>
      </div>
      
      <div class="flex items-center justify-between pt-3 mt-3 border-t border-gray-200">
        <span class="font-medium text-gray-700">Total gastos de crédito:</span>
        <span class="font-bold text-lg text-gray-900">
          ${{ totalCreditExpenses.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
        </span>
      </div>
        </div>
      </div>
      <div v-else class="cf-card h-32 bg-gray-100 animate-pulse rounded-xl"></div>
    </Transition>

    <!-- Sección: Actividad Reciente -->
    <div class="space-y-6">
      <div class="flex items-center space-x-3">
        <div class="w-1 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
        <h2 class="text-lg sm:text-xl font-bold text-gray-900">Actividad Reciente</h2>
    </div>

    <!-- Lista de gastos recientes -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-2"
      >
        <div v-if="!isLoading" class="cf-card">
          <div class="cf-card-head px-4 sm:px-5 py-3 sm:py-4">
            <h3 class="cf-card-title text-sm sm:text-base">Gastos Recientes</h3>
          </div>
      
          <div v-if="recentExpenses.length === 0" class="text-center py-6 sm:py-8 px-4">
            <p class="cf-muted text-sm">No hay gastos registrados</p>
          </div>
          
          <div v-else class="space-y-2 p-3 sm:p-4">
        <div
          v-for="(expense, i) in recentExpenses.slice(0, 5)"
          :key="expense.id"
          :class="[
            'cf-row p-2 sm:p-3',
            expense.isFixed ? 'cf-row-fixed' : ''
          ]"
          v-motion
          :initial="{ opacity: 0, y: 6 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 0.2, delay: i * 0.02 } }"
        >
          <div class="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <span class="cf-chip text-[10px] flex-shrink-0">
              {{ expense.category.name }}
            </span>
            <div class="min-w-0 flex-1">
              <div class="flex items-center space-x-1 sm:space-x-2">
                <p class="cf-row-title text-xs sm:text-sm truncate">{{ expense.description }}</p>
                <span v-if="expense.isFixed" class="cf-chip cf-chip-blue text-[10px] flex-shrink-0">
                  Fijo
                </span>
              </div>
              <p class="cf-row-secondary text-[10px] sm:text-xs">{{ format(parseLocalDate(expense.date), 'dd/MM/yyyy') }}</p>
            </div>
          </div>
          <span class="cf-row-amount text-xs sm:text-sm flex-shrink-0">
            ${{ expense.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
          </span>
          </div>
          </div>
        </div>
        <div v-else class="cf-card h-32 bg-gray-100 animate-pulse rounded-xl"></div>
      </Transition>
    </div>
    </div>

    
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format } from 'date-fns'
import { useRouter } from 'vue-router'
import { useExpenseStore } from '../stores/expenseStore'
import BudgetProgress from '../components/BudgetProgress.vue'
import KeyMetricsCards from '../components/charts/KeyMetricsCards.vue'
import ExpensesByCategoryChart from '../components/charts/ExpensesByCategoryChart.vue'
import DailyExpensesChart from '../components/charts/DailyExpensesChart.vue'
import ExpensesCalendar from '../components/charts/ExpensesCalendar.vue'
import { parseLocalDate } from '../utils/date'
import AppDatePicker from '../components/ui/AppDatePicker.vue'
import LoadingSkeleton from '../components/ui/LoadingSkeleton.vue'

const router = useRouter()

const expenseStore = useExpenseStore()

// Estado de loading
const isLoading = ref(false)

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

// Manejar cambio de mes con animación suave
const handleMonthChange = async () => {
  isLoading.value = true
  // Tiempo de transición más corto y suave
  await new Promise(resolve => setTimeout(resolve, 400))
  isLoading.value = false
}

// Watcher para el mes seleccionado
watch(selectedMonth, () => {
  handleMonthChange()
})

// Etiquetas del header
const formattedMonthLabel = computed(() => {
  try {
    const [y, m] = selectedMonth.value.split('-').map(Number)
    return format(new Date(y, (m || 1) - 1, 1), 'MMMM yyyy')
  } catch { return selectedMonth.value }
})

const budgetProgressBadgeClass = computed(() => {
  const p = Number(budgetProgress.value) || 0
  if (p >= 100) return 'bg-red-100 text-red-700'
  if (p >= 80) return 'bg-amber-100 text-amber-700'
  return 'bg-emerald-100 text-emerald-700'
})

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
  if (!fixedExpenseId) return 'N/A'
  
  const fixedExpense = expenseStore.fixedExpenses.find(fe => fe.id === fixedExpenseId)
  if (fixedExpense && fixedExpense.dayOfMonth) {
    return fixedExpense.dayOfMonth
  }
  return 'N/A'
}


</script>

<style scoped>
/* Card Finance pilot styles (scoped) */
.cf-surface { 
  background: radial-gradient(1200px 600px at 100% -20%, rgba(60, 99, 255, 0.06), transparent 60%), 
              radial-gradient(1200px 600px at -10% 110%, rgba(60, 99, 255, 0.05), transparent 60%); 
  padding: 1rem;
}

@media (min-width: 640px) {
  .cf-surface { padding: 1.5rem; }
}

@media (min-width: 1024px) {
  .cf-surface { padding: 2rem; }
}

.cf-header { padding-bottom: 0.5rem; }
.cf-title { @apply font-bold text-gray-900; letter-spacing: -0.01em; }
.cf-subtitle { @apply text-gray-600 mt-1; }

.cf-card { 
  @apply bg-white rounded-xl border border-gray-100 shadow-sm; 
  box-shadow: 0 4px 12px rgba(15,23,42,0.04);
  overflow: hidden; 
  margin-bottom: 1rem;
}

@media (min-width: 640px) {
  .cf-card { 
    box-shadow: 0 8px 24px rgba(15,23,42,0.06);
    margin-bottom: 1.5rem;
  }
}

.cf-card-head { 
  @apply border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white; 
  padding: 0.75rem 1rem;
}

@media (min-width: 640px) {
  .cf-card-head { padding: 1rem 1.25rem; }
}

.cf-card-title { @apply font-semibold text-gray-900; }

.cf-row { 
  @apply flex items-center justify-between border border-gray-100 rounded-lg bg-white; 
  transition: transform 160ms cubic-bezier(0.22,1,0.36,1), box-shadow 160ms; 
  box-shadow: 0 1px 4px rgba(15,23,42,0.04);
  padding: 0.5rem;
}

@media (min-width: 640px) {
  .cf-row { 
    padding: 0.75rem;
    box-shadow: 0 2px 10px rgba(15,23,42,0.04);
  }
}

.cf-row:hover { 
  transform: translateY(-1px); 
  box-shadow: 0 4px 12px rgba(15,23,42,0.08);
}

@media (min-width: 640px) {
  .cf-row:hover { 
    box-shadow: 0 6px 18px rgba(15,23,42,0.08);
  }
}

.cf-row-fixed { @apply bg-blue-50 border-blue-200; }
.cf-row-credit { @apply bg-red-50 border-red-200; }
.cf-row-title { @apply font-medium text-gray-900; }
.cf-row-secondary { @apply text-gray-500; }
.cf-row-amount { @apply font-semibold text-gray-900; }

.cf-chip { @apply inline-flex items-center rounded-full font-medium bg-gray-100 text-gray-800; }
.cf-chip-blue { @apply bg-blue-100 text-blue-800; }
.cf-chip-red { @apply bg-red-100 text-red-800; }

.cf-muted { @apply text-gray-500; }

.cf-btn-primary { 
  @apply inline-flex justify-center items-center border border-transparent font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800; 
  box-shadow: 0 6px 16px rgba(15,23,42,0.15);
  transition: transform 140ms cubic-bezier(0.22,1,0.36,1);
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

@media (min-width: 640px) {
  .cf-btn-primary { 
    box-shadow: 0 10px 22px rgba(15,23,42,0.18);
    padding: 0.5rem 1rem;
  }
}

.cf-btn-primary:active { transform: translateY(1px) scale(0.99); }

</style>
