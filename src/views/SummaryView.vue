<template>
  <div class="space-y-6">
    <div class="flex justify-between items-start">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Dashboard de Análisis</h1>
        <p class="text-gray-600 mt-1">Vista general y análisis detallado de tus finanzas</p>
      </div>
      <button
        @click="showModal = true"
        class="btn-primary inline-flex items-center space-x-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span>Agregar Gasto</span>
      </button>
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
    <BudgetProgress />

    <!-- Gráfico de gastos por categoría -->
    <ExpensesByCategoryChart :expenses-by-category="expensesByCategory" />

    <!-- Gráfico de gastos diarios -->
    <DailyExpensesChart 
      :daily-data="dailyExpensesData" 
      :current-month="currentMonth"
    />

    <!-- Gráfico de progreso mensual -->
    <MonthlyProgressChart 
      :daily-data="dailyExpensesData" 
      :budget="budget.amount"
      :current-month="currentMonth"
    />

    <!-- Calendario de gastos -->
    <ExpensesCalendar 
      :daily-data="dailyExpensesData"
      :expenses="currentMonthExpenses"
      :fixed-expenses="fixedExpenses"
    />

    <!-- Categorías de gastos -->
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Gastos por Categoría</h2>
      
      <div v-if="expensesByCategory.length === 0" class="text-center py-8">
        <p class="text-gray-500">No hay gastos registrados este mes</p>
      </div>
      
      <div v-else class="space-y-3">
        <div
          v-for="category in expensesByCategory"
          :key="category.category.id"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: category.category.color }"></div>
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

    <!-- Estadísticas de gastos fijos -->
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Gastos Fijos del Mes</h2>
      
      <div v-if="fixedExpensesThisMonth.length === 0" class="text-center py-8">
        <p class="text-gray-500">No hay gastos fijos este mes</p>
      </div>
      
      <div v-else class="space-y-3">
        <div
          v-for="expense in fixedExpensesThisMonth"
          :key="expense.id"
          class="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">{{ expense.description }}</p>
              <div class="flex items-center space-x-2 mt-1">
                <span class="text-xs text-blue-600 font-medium">Fijo</span>
                <span class="text-xs text-gray-500">•</span>
                <span class="text-xs text-gray-500">Paga el día {{ getDayOfMonth(expense.fixedExpenseId) }}</span>
              </div>
            </div>
          </div>
          <span class="text-sm font-semibold text-gray-900">
            ${{ expense.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
          </span>
        </div>
        
        <div class="mt-4 pt-3 border-t border-blue-200">
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium text-blue-700">Total gastos fijos:</span>
            <span class="text-sm font-bold text-blue-700">
              ${{ totalFixedExpenses.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Resumen de gastos de crédito -->
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Gastos de Crédito del Mes</h2>
      
      <div v-if="creditExpensesThisMonth.length === 0" class="text-center py-8">
        <div class="text-gray-400 mb-2">
          <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <p class="text-gray-500">No hay gastos de crédito este mes</p>
        <p class="text-xs text-gray-400 mt-1">Los pagos de tarjetas de crédito aparecerán aquí</p>
      </div>
      
      <div v-else class="space-y-3">
        <div
          v-for="expense in creditExpensesThisMonth"
          :key="expense.id"
          class="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">{{ expense.description }}</p>
              <div class="flex items-center space-x-2 mt-1">
                <span class="text-xs text-red-600 font-medium">Crédito</span>
                <span class="text-xs text-gray-500">{{ format(parseLocalDate(expense.date), 'dd/MM/yyyy') }}</span>
              </div>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm font-semibold text-gray-900">
              ${{ expense.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
            </p>
            <p class="text-xs text-gray-500">{{ expense.category.name }}</p>
          </div>
        </div>
        
        <!-- Total de gastos de crédito -->
        <div class="mt-4 pt-3 border-t border-red-200">
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium text-gray-700">Total gastos de crédito:</span>
            <span class="text-lg font-bold text-red-600">
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
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Gastos Recientes</h2>
      
      <div v-if="recentExpenses.length === 0" class="text-center py-8">
        <p class="text-gray-500">No hay gastos registrados</p>
      </div>
      
      <div v-else class="space-y-2">
        <div
          v-for="expense in recentExpenses.slice(0, 5)"
          :key="expense.id"
          :class="[
            'flex items-center justify-between p-3 border rounded-lg',
            expense.isFixed ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
          ]"
        >
          <div class="flex items-center space-x-3">
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              {{ expense.category.name }}
            </span>
            <div>
              <div class="flex items-center space-x-2">
                <p class="text-sm font-medium text-gray-900">{{ expense.description }}</p>
                <span v-if="expense.isFixed" class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Fijo
                </span>
              </div>
              <p class="text-xs text-gray-500">{{ format(parseLocalDate(expense.date), 'dd/MM/yyyy') }}</p>
            </div>
          </div>
          <span class="text-sm font-semibold text-gray-900">
            ${{ expense.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Modal para agregar gastos -->
    <ExpenseModal 
      :is-open="showModal"
      @close="showModal = false"
      @expense-added="handleExpenseAdded"
    />

    <!-- Floating Action Button para móvil -->
    <div class="lg:hidden fixed bottom-6 right-6 z-30">
      <button
        @click="showModal = true"
        class="btn-primary rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import { useExpenseStore } from '../stores/expenseStore'
import BudgetProgress from '../components/BudgetProgress.vue'
import ExpenseModal from '../components/ExpenseModal.vue'
import KeyMetricsCards from '../components/charts/KeyMetricsCards.vue'
import ExpensesByCategoryChart from '../components/charts/ExpensesByCategoryChart.vue'
import DailyExpensesChart from '../components/charts/DailyExpensesChart.vue'
import MonthlyProgressChart from '../components/charts/MonthlyProgressChart.vue'
import ExpensesCalendar from '../components/charts/ExpensesCalendar.vue'
import { parseLocalDate } from '../utils/date'

const expenseStore = useExpenseStore()
const showModal = ref(false)

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

const averageExpense = computed(() => {
  if (currentMonthExpenses.value.length === 0) return 0
  return totalSpent.value / currentMonthExpenses.value.length
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
  const fixedExpense = expenseStore.fixedExpenses.find(fe => fe.id === fixedExpenseId)
  if (fixedExpense && fixedExpense.dayOfMonth) {
    return fixedExpense.dayOfMonth
  }
  return 'N/A'
}

const handleExpenseAdded = () => {
  // El modal se cierra automáticamente después de agregar el gasto
  // Aquí podrías agregar lógica adicional si es necesario
}

</script>

<style scoped>
.btn-primary {
  @apply inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500;
}
</style>
