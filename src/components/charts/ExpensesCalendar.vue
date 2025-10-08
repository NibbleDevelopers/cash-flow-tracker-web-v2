<template>
  <div class="card p-3 sm:p-4">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
      <h3 class="text-base sm:text-lg font-semibold text-gray-900">Calendario de Gastos</h3>
      <div class="flex flex-wrap items-center gap-3 sm:gap-4">
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 rounded-full bg-blue-500"></div>
          <span class="text-xs sm:text-sm text-gray-600">Gastos del día</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 rounded-full bg-red-500"></div>
          <span class="text-xs sm:text-sm text-gray-600">Gastos fijos</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 rounded-full bg-green-500"></div>
          <span class="text-xs sm:text-sm text-gray-600">Sin gastos</span>
        </div>
      </div>
    </div>

    <div v-if="calendarDays.length === 0" class="text-center py-6 sm:py-8">
      <div class="text-gray-400 mb-2">
        <svg class="mx-auto h-8 w-8 sm:h-12 sm:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <p class="text-sm text-gray-500">No hay gastos registrados este mes</p>
    </div>

    <div v-else>
      <!-- Navegación del mes -->
      <div class="flex justify-between items-center mb-3 sm:mb-4">
        <button
          @click="previousMonth"
          class="p-2 sm:p-1.5 rounded-md border border-transparent text-primary-700 hover:bg-primary-50 hover:border-primary-200 transition-colors"
        >
          <svg class="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h4
          class="text-sm sm:text-base font-semibold text-gray-900"
          :key="format(currentDate, 'yyyy-MM')"
          v-motion
          :initial="{ opacity: 0, y: -4 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 0.2 } }"
        >
          {{ format(currentDate, 'MMMM yyyy', { locale: es }) }}
        </h4>
        
        <button
          @click="nextMonth"
          class="p-2 sm:p-1.5 rounded-md border border-transparent text-primary-700 hover:bg-primary-50 hover:border-primary-200 transition-colors"
        >
          <svg class="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Resumen por quincenas -->
      <div class="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-2 sm:p-3 rounded-lg border border-blue-200">
          <div class="flex items-center justify-between">
            <div>
              <h5 class="text-[10px] sm:text-xs font-semibold text-blue-800">Primera Quincena</h5>
              <p class="text-[9px] sm:text-xs text-blue-600">1-15</p>
            </div>
            <div class="text-right">
              <p class="text-xs sm:text-sm font-bold text-blue-900">
                ${{ formatCurrency(firstFortnightTotal) }}
              </p>
              <p class="text-[9px] sm:text-xs text-blue-600">{{ firstFortnightCount }} gastos</p>
            </div>
          </div>
          <div v-if="firstFortnightBudget > 0" class="mt-1 sm:mt-2">
            <div class="flex justify-between text-[9px] sm:text-[10px] text-blue-700 mb-1">
              <span>Presupuesto: ${{ formatCurrency(firstFortnightBudget, true) }}</span>
              <span>{{ firstFortnightProgress.toFixed(0) }}%</span>
            </div>
            <div class="w-full h-1 sm:h-1.5 bg-blue-200 rounded-full overflow-hidden">
              <div class="h-full bg-blue-600" :style="{ width: Math.min(100, firstFortnightProgress) + '%' }"></div>
            </div>
          </div>
        </div>
        
        <div class="bg-gradient-to-r from-green-50 to-green-100 p-2 sm:p-3 rounded-lg border border-green-200">
          <div class="flex items-center justify-between">
            <div>
              <h5 class="text-[10px] sm:text-xs font-semibold text-green-800">Segunda Quincena</h5>
              <p class="text-[9px] sm:text-xs text-green-600">16-31</p>
            </div>
            <div class="text-right">
              <p class="text-xs sm:text-sm font-bold text-green-900">
                ${{ formatCurrency(secondFortnightTotal) }}
              </p>
              <p class="text-[9px] sm:text-xs text-green-600">{{ secondFortnightCount }} gastos</p>
            </div>
          </div>
          <div v-if="secondFortnightBudget > 0" class="mt-1 sm:mt-2">
            <div class="flex justify-between text-[9px] sm:text-[10px] text-green-700 mb-1">
              <span>Presupuesto: ${{ formatCurrency(secondFortnightBudget, true) }}</span>
              <span>{{ secondFortnightProgress.toFixed(0) }}%</span>
            </div>
            <div class="w-full h-1 sm:h-1.5 bg-green-200 rounded-full overflow-hidden">
              <div class="h-full bg-green-600" :style="{ width: Math.min(100, secondFortnightProgress) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Días de la semana -->
      <div class="grid grid-cols-7 gap-1.5 mb-2">
        <div
          v-for="day in WEEK_DAYS"
          :key="day"
          class="text-center text-xs font-medium text-gray-500 py-1 bg-gray-50 rounded-md"
        >
          {{ day }}
        </div>
      </div>

      <!-- Calendario -->
      <div class="grid grid-cols-7 gap-1.5">
        <div
          v-for="(day, i) in calendarDays"
          :key="day.date"
          :class="[
            'relative p-2 min-h-[70px] border border-gray-100 rounded-lg transition-colors duration-150 cursor-pointer group',
            day.isCurrentMonth ? 'bg-white hover:bg-primary-50/30' : 'bg-gray-50',
            day.isToday ? 'ring-1 ring-primary-400 border-primary-300 bg-primary-50/50' : '',
            getDayClass(day)
          ]"
          v-motion
          :initial="{ opacity: 0, y: 6 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 0.18, delay: (i % 7) * 0.02 } }"
          @mouseenter="hoveredDay = day"
          @mouseleave="hoveredDay = null"
          @click="openDayModal(day)"
        >
          <!-- Número del día -->
          <div class="mb-1">
            <span
              :class="[
                'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold',
                day.isToday
                  ? 'bg-primary-600 text-white'
                  : (day.isCurrentMonth
                      ? (hoveredDay && hoveredDay.date === day.date
                          ? 'bg-primary-100 text-primary-900'
                          : 'text-gray-700')
                      : 'text-gray-400')
              ]"
            >
              {{ day.dayNumber }}
            </span>
          </div>

          <!-- Indicadores de gastos -->
          <div v-if="day.expenses.length > 0" class="space-y-0.5">
            <!-- Gastos fijos -->
            <div
              v-if="day.fixedExpenses.length > 0"
              class="flex items-center space-x-1"
            >
              <div class="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              <span class="text-xs text-red-600 font-medium">
                ${{ formatCurrency(day.fixedExpenses.reduce((sum, exp) => sum + exp.amount, 0)) }}
              </span>
            </div>

            <!-- Gastos regulares -->
            <div
              v-if="day.regularExpenses.length > 0"
              class="flex items-center space-x-1"
            >
              <div class="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              <span class="text-xs text-blue-600 font-medium">
                ${{ formatCurrency(day.regularExpenses.reduce((sum, exp) => sum + exp.amount, 0)) }}
              </span>
            </div>

            <!-- Total del día -->
            <div class="text-xs font-bold text-gray-800 pt-0.5 border-t border-gray-200 bg-gray-50 rounded px-1">
              ${{ formatCurrency(day.totalAmount) }}
            </div>
          </div>

          <!-- Indicador de sin gastos -->
          <div
            v-else-if="day.isCurrentMonth"
            class="flex items-center justify-center h-full"
          >
            <div class="w-1.5 h-1.5 rounded-full bg-green-400 opacity-50"></div>
          </div>

          <!-- Tooltip con detalles de gastos -->
          <div
            v-if="hoveredDay && hoveredDay.date === day.date && day.expenses.length > 0"
            class="absolute z-50 w-64 p-2 bg-white border border-gray-200 rounded-lg shadow-xl transform -translate-x-1/2 -translate-y-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
            style="left: 50%; top: -10px;"
          >
            <!-- Flecha del tooltip -->
            <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200"></div>
            
            <div class="relative z-10">
              <h6 class="text-xs font-semibold text-gray-900 mb-1 pb-1 border-b border-gray-100">
                {{ format(parseLocalDate(day.date), 'dd \'de\' MMMM', { locale: es }) }}
              </h6>
              
              <div class="space-y-0.5">
                <div
                  v-for="expense in day.expenses.slice(0, TOOLTIP_MAX_EXPENSES)"
                  :key="expense.id"
                  class="flex items-center justify-between py-0.5 px-1 rounded"
                >
                  <div class="flex items-center space-x-1 min-w-0 flex-1">
                    <div
                      class="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      :style="{ backgroundColor: expense.category?.color || '#6B7280' }"
                    ></div>
                    <div class="min-w-0 flex-1">
                      <p class="text-xs font-medium text-gray-900 truncate">{{ expense.description }}</p>
                      <div class="flex items-center space-x-1">
                        <p class="text-xs text-gray-500">{{ expense.category?.name || 'Sin categoría' }}</p>
                        <span
                          v-if="expense.isFixed"
                          class="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
                        >
                          Fijo
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="text-right flex-shrink-0 ml-1">
                    <p class="text-xs font-semibold text-gray-900">
                      ${{ formatCurrency(expense.amount) }}
                    </p>
                  </div>
                </div>
                
                <!-- Indicador de más gastos -->
                <div
                  v-if="day.expenses.length > TOOLTIP_MAX_EXPENSES"
                  class="text-xs text-gray-500 text-center py-0.5"
                >
                  +{{ day.expenses.length - TOOLTIP_MAX_EXPENSES }} más...
                </div>
              </div>

              <div class="mt-1 pt-1 border-t border-gray-100">
                <div class="flex justify-between items-center">
                  <span class="text-xs font-medium text-gray-700">Total:</span>
                  <span class="text-xs font-bold text-gray-900">
                    ${{ formatCurrency(day.totalAmount) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Modal de detalles del día -->
    <div
      v-if="selectedDay"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click="closeDayModal"
    >
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Overlay -->
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeDayModal"></div>

        <!-- Modal -->
        <div
          class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          @click.stop
        >
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="w-full">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold text-gray-900">
                    Gastos del {{ format(parseLocalDate(selectedDay.date), 'dd \'de\' MMMM yyyy', { locale: es }) }}
                  </h3>
                  <button
                    @click="closeDayModal"
                    class="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div v-if="selectedDay.expenses.length === 0" class="text-center py-8">
                  <div class="text-gray-400 mb-2">
                    <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p class="text-gray-500">No hay gastos registrados este día</p>
                </div>

                <div v-else class="space-y-3 max-h-96 overflow-y-auto">
                  <div
                    v-for="expense in selectedDay.expenses"
                    :key="expense.id"
                    class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div class="flex items-center space-x-3 min-w-0 flex-1">
                      <div
                        class="w-4 h-4 rounded-full flex-shrink-0"
                        :style="{ backgroundColor: expense.category?.color || '#6B7280' }"
                      ></div>
                      <div class="min-w-0 flex-1">
                        <p class="text-sm font-medium text-gray-900">{{ expense.description }}</p>
                        <div class="flex items-center space-x-2 mt-1">
                          <p class="text-xs text-gray-500">{{ expense.category?.name || 'Sin categoría' }}</p>
                          <span
                            v-if="expense.isFixed"
                            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                          >
                            Fijo
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="text-right flex-shrink-0 ml-3">
                      <p class="text-sm font-semibold text-gray-900">
                        ${{ formatCurrency(expense.amount, true) }}
                      </p>
                    </div>
                  </div>
                </div>

                <div v-if="selectedDay.expenses.length > 0" class="mt-4 pt-4 border-t border-gray-200">
                  <div class="flex justify-between items-center">
                    <span class="text-base font-medium text-gray-700">Total del día:</span>
                    <span class="text-xl font-bold text-gray-900">
                      ${{ formatCurrency(selectedDay.totalAmount, true) }}
                    </span>
                  </div>
                  <div class="mt-2 text-sm text-gray-500">
                    {{ selectedDay.expenses.length }} {{ selectedDay.expenses.length === 1 ? 'gasto' : 'gastos' }} registrado{{ selectedDay.expenses.length === 1 ? '' : 's' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format, startOfMonth, endOfMonth, addMonths, subMonths, isSameDay, isSameMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import { parseLocalDate } from '../../utils/date'

// Constantes
const WEEK_DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const CALENDAR_WEEKS = 6
const DAYS_PER_WEEK = 7
const TOTAL_CALENDAR_DAYS = CALENDAR_WEEKS * DAYS_PER_WEEK
const FIRST_FORTNIGHT_END = 15
const TOOLTIP_MAX_EXPENSES = 3

// Props
const props = defineProps({
  dailyData: {
    type: Array,
    default: () => []
  },
  expenses: {
    type: Array,
    default: () => []
  },
  fixedExpenses: {
    type: Array,
    default: () => []
  },
  monthlyBudget: {
    type: Number,
    default: 0
  },
  month: {
    type: String,
    default: '' // formato 'yyyy-MM'
  }
})

// Emits
const emit = defineEmits(['day-selected', 'month-changed'])

// Estado reactivo
const currentDate = ref(new Date())
const hoveredDay = ref(null)
const selectedDay = ref(null)

// Funciones auxiliares
const getFortnightData = (isFirstFortnight) => {
  const days = calendarDays.value.filter(day => {
    if (!day.isCurrentMonth) return false
    return isFirstFortnight 
      ? day.dayNumber <= FIRST_FORTNIGHT_END 
      : day.dayNumber > FIRST_FORTNIGHT_END
  })
  
  return {
    total: days.reduce((sum, day) => sum + day.totalAmount, 0),
    count: days.reduce((sum, day) => sum + day.expenses.length, 0)
  }
}

const formatCurrency = (amount, showDecimals = false) => {
  return amount.toLocaleString('es-ES', { 
    minimumFractionDigits: showDecimals ? 2 : 0 
  })
}

const getExpensesForDay = (dayDate) => {
  return props.expenses.filter(expense => {
    const expenseDate = parseLocalDate(expense.date)
    return isSameDay(expenseDate, dayDate)
  })
}

const categorizeExpenses = (expenses) => {
  return {
    fixed: expenses.filter(expense => expense.isFixed),
    regular: expenses.filter(expense => !expense.isFixed)
  }
}

// Computed properties optimizadas
const firstFortnightData = computed(() => getFortnightData(true))
const secondFortnightData = computed(() => getFortnightData(false))

const firstFortnightTotal = computed(() => firstFortnightData.value.total)
const firstFortnightCount = computed(() => firstFortnightData.value.count)
const secondFortnightTotal = computed(() => secondFortnightData.value.total)
const secondFortnightCount = computed(() => secondFortnightData.value.count)

// Presupuesto quincenal (50/50 del mensual)
const firstFortnightBudget = computed(() => (props.monthlyBudget || 0) / 2)
const secondFortnightBudget = computed(() => (props.monthlyBudget || 0) / 2)
const firstFortnightProgress = computed(() => firstFortnightBudget.value > 0 ? (firstFortnightTotal.value / firstFortnightBudget.value) * 100 : 0)
const secondFortnightProgress = computed(() => secondFortnightBudget.value > 0 ? (secondFortnightTotal.value / secondFortnightBudget.value) * 100 : 0)

// Crear datos del calendario
const calendarDays = computed(() => {
  const monthStart = startOfMonth(currentDate.value)
  const startDate = new Date(monthStart)
  startDate.setDate(startDate.getDate() - monthStart.getDay()) // Comenzar desde el domingo
  
  const days = []
  const currentDay = new Date(startDate)
  
  // Generar días del calendario
  for (let i = 0; i < TOTAL_CALENDAR_DAYS; i++) {
    const dayDate = new Date(currentDay)
    const dateStr = format(dayDate, 'yyyy-MM-dd')
    
    // Obtener gastos para este día
    const dayExpenses = getExpensesForDay(dayDate)
    const { fixed: fixedExpenses, regular: regularExpenses } = categorizeExpenses(dayExpenses)
    const totalAmount = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    
    days.push({
      date: dateStr,
      dayNumber: dayDate.getDate(),
      isCurrentMonth: isSameMonth(dayDate, currentDate.value),
      isToday: isSameDay(dayDate, new Date()),
      expenses: dayExpenses,
      fixedExpenses,
      regularExpenses,
      totalAmount
    })
    
    currentDay.setDate(currentDay.getDate() + 1)
  }
  
  return days
})

// Funciones de utilidad
const getDayClass = (day) => {
  if (!day.isCurrentMonth) return ''
  if (day.totalAmount === 0) return 'hover:bg-green-50'
  if (day.fixedExpenses.length > 0) return 'hover:bg-red-50'
  return 'hover:bg-blue-50'
}

const clearModalState = () => {
  hoveredDay.value = null
  selectedDay.value = null
}

const navigateMonth = (direction) => {
  const newDate = direction === 'next' 
    ? addMonths(currentDate.value, 1)
    : subMonths(currentDate.value, 1)
  
  currentDate.value = newDate
  clearModalState()
  try {
    emit('month-changed', format(newDate, 'yyyy-MM'))
  } catch {}
}

// Funciones de eventos
const openDayModal = (day) => {
  if (day?.expenses?.length > 0) {
    selectedDay.value = day
    emit('day-selected', day)
  }
}

const closeDayModal = () => {
  selectedDay.value = null
}

const previousMonth = () => navigateMonth('previous')
const nextMonth = () => navigateMonth('next')

// Watchers
watch(currentDate, clearModalState)

// Sincronizar mes externo (yyyy-MM)
watch(() => props.month, (m) => {
  const val = (m || '').trim()
  if (/^\d{4}-\d{2}$/.test(val)) {
    const [y, mm] = val.split('-').map(Number)
    currentDate.value = new Date(y, mm - 1, 1)
  }
})
</script>

<style scoped>
.card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6;
}
</style>
