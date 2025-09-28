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

    <!-- Filtros -->
    <div class="space-y-4 mb-6">
      <!-- Fila 1: Búsqueda (full width) -->
      <div class="grid grid-cols-1 gap-4">
        <div class="flex flex-col">
          <label class="block text-sm font-medium text-gray-700 mb-2">Buscar gastos</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
            </span>
            <input
              ref="searchInputRef"
              v-model="searchInput"
              type="text"
              class="input-field h-10 pl-9 pr-8"
              placeholder="Buscar por descripción, categoría o palabra clave"
              @keydown.enter.prevent="applySearchNow"
            />
            <button
              v-if="searchQuery"
              type="button"
              class="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600"
              @click="clearSearch"
              title="Limpiar búsqueda"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Fila 2: Categoría y Tipo -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col">
          <label class="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
          <AppSelect
            v-model="selectedCategoryId"
            :options="categoryFilterOptions"
            placeholder="Todas las categorías"
            class="h-10"
          />
        </div>
        <div class="flex flex-col">
          <label class="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
          <AppSelect
            v-model="selectedEntryType"
            :options="typeOptions"
            placeholder="Todos"
            class="h-10"
          />
        </div>
      </div>
      
      <!-- Fila 2: Periodo, Orden y Rango de fechas -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="flex flex-col">
          <label class="block text-sm font-medium text-gray-700 mb-2">Periodo</label>
          <AppSelect
            v-model="period"
            :options="periodOptions"
            placeholder="Mes actual"
            class="h-10"
          />
        </div>
        <div class="flex flex-col">
          <label class="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
          <AppSelect
            v-model="sortOrder"
            :options="sortOptions"
            placeholder="Más recientes primero"
            class="h-10"
          />
        </div>
        <div class="flex flex-col">
          <label class="block text-sm font-medium text-gray-700 mb-2">Rango personalizado</label>
          <button
            ref="rangeBtnRef"
            type="button"
            class="input-field flex items-center justify-between h-10"
            @click="toggleRange"
          >
            <span class="truncate text-left">{{ rangeLabel }}</span>
            <svg class="h-4 w-4 text-gray-400 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Popover de rango personalizado -->
    <Teleport to="body">
      <Transition
        enter-active-class="ease-out duration-150"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="ease-in duration-100"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="showRange"
          class="fixed z-[60] bg-white border border-gray-200 rounded-lg shadow-xl p-3 w-[320px]"
          :style="rangePickerStyle"
          ref="rangePopoverRef"
          @click.stop
        >
          <!-- Presets -->
          <div class="flex flex-wrap gap-2 mb-3">
            <button class="px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200" @click="applyPreset('7')">Últimos 7 días</button>
            <button class="px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200" @click="applyPreset('30')">Últimos 30 días</button>
            <button class="px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200" @click="applyPreset('thisMonth')">Este mes</button>
            <button class="px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200" @click="applyPreset('lastMonth')">Mes anterior</button>
          </div>
          <!-- Header calendario -->
          <div class="flex items-center justify-between mb-2">
            <button class="p-1 rounded hover:bg-gray-100" @click="rangePrevMonth">
              <svg class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div class="text-sm font-medium text-gray-900">{{ rangeMonthName }} {{ rangeYear }}</div>
            <button class="p-1 rounded hover:bg-gray-100" @click="rangeNextMonth">
              <svg class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          <!-- Días -->
          <div class="grid grid-cols-7 gap-1 mb-1 text-[11px] text-gray-500">
            <div v-for="d in ['D','L','M','M','J','V','S']" :key="d" class="text-center py-1">{{ d }}</div>
          </div>
          <div class="grid grid-cols-7 gap-1">
            <button
              v-for="day in rangeCalendarDays"
              :key="day.date"
              @click="onPick(day.date)"
              :class="[
                'h-8 w-8 rounded-md text-xs font-medium transition-colors',
                !day.isCurrentMonth ? 'text-gray-300' : 'text-gray-700 hover:bg-primary-50',
                day.isInRange ? 'bg-primary-100 text-primary-900' : '',
                day.isStart || day.isEnd ? 'bg-primary-600 text-white hover:bg-primary-700' : ''
              ]"
            >
              {{ day.day }}
            </button>
          </div>
          <!-- Footer -->
          <div class="flex justify-between mt-3 pt-2 border-t border-gray-200">
            <button class="text-xs text-gray-600 hover:text-gray-800" @click="clearRange">Limpiar</button>
            <button class="text-xs text-primary-600 hover:text-primary-700" @click="applyRange">Aplicar</button>
          </div>
        </div>
      </Transition>
    </Teleport>

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

    <div v-else>
      <!-- Skeletons cuando se filtra -->
      <div v-if="isFiltering" class="space-y-3">
        <div v-for="i in 5" :key="i" class="p-4 rounded-lg border border-gray-200 bg-gray-50 animate-pulse">
          <div class="h-3 w-32 bg-gray-200 rounded mb-2"></div>
          <div class="h-3 w-20 bg-gray-200 rounded"></div>
        </div>
      </div>

      <!-- Contador -->
      <div class="flex items-center justify-between text-xs text-gray-500 mb-2" v-else>
        <span>Mostrando {{ Math.min(shownCount, totalFiltered) }} de {{ totalFiltered }}</span>
      </div>

      <!-- Lista agrupada por fecha -->
      <transition-group name="fade" tag="div" class="space-y-4" v-if="!isFiltering">
        <div v-for="group in groupedPagedExpenses" :key="group.key" class="space-y-2">
          <div class="sticky top-16 bg-white/70 backdrop-blur text-xs text-gray-600 font-medium px-1">{{ group.label }}</div>
          <div
            v-for="expense in group.items"
        :key="expense.id"
        :class="[
              'flex items-center justify-between p-4 rounded-xl border transition hover:shadow-sm',
              expense.isFixed ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
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
              <div class="flex items-center space-x-4 mt-1">
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
        <div class="text-right">
          <p class="text-sm font-semibold text-gray-900">
            ${{ expense.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
          </p>
              <div class="mt-2 flex justify-end gap-2">
                <button
                  class="p-1.5 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-primary-700"
                  title="Editar"
                  @click.stop="onEdit(expense)"
                >
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5h2m-6 14h10a2 2 0 002-2v-5.586a1 1 0 00-.293-.707l-6.414-6.414A1 1 0 0011.586 4H6a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </button>
                <button
                  class="p-1.5 rounded-md border border-gray-200 bg-white text-red-600 hover:bg-red-50"
                  title="Eliminar"
                  @click.stop="onDelete(expense)"
                >
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0V5a2 2 0 012-2h2a2 2 0 012 2v2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition-group>
    </div>

    <div v-if="totalFiltered > 0 && !isFiltering" class="mt-4">
      <div class="flex justify-center">
        <button
          v-if="shownCount < totalFiltered"
          class="inline-flex items-center px-4 py-2 rounded-lg text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-sm transition"
          @click="onLoadMore"
        >
          <svg v-if="loadingMore" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ loadingMore ? 'Cargando...' : 'Cargar más' }}
        </button>
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
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { format } from 'date-fns'
import { notify } from '../services/notifications.js'
import { es } from 'date-fns/locale'
import { useExpenseStore } from '../stores/expenseStore'
import AppSelect from './ui/AppSelect.vue'
import { useConfirm } from '../composables/useConfirm'
import { parseLocalDate } from '../utils/date'

const expenseStore = useExpenseStore()
const confirm = useConfirm()
const emit = defineEmits(['edit-expense', 'delete-expense'])

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

// Identificar gasto de crédito (nuevo criterio: por debtId)
const isCreditPayment = (expense) => {
  if (expense?.debtId) return true
  // Backward compatibility por si hay datos antiguos en memoria
  const categoryName = expense.category?.name?.toLowerCase() || ''
  if (categoryName === 'crédito' || categoryName === 'credito') return true
  const description = expense.description?.toLowerCase() || ''
  if (description.includes('cuota') && (description.includes('crédito') || description.includes('credito'))) return true
  return false
}

// Estado de filtros y paginación
const searchQuery = ref('')
const selectedCategoryId = ref('')
const selectedEntryType = ref('') // '' | 'charge' | 'payment'
const period = ref('month') // month | 7 | 30 | all
const sortOrder = ref('desc') // desc | asc
const pageSize = ref(10)
const shownCount = ref(pageSize.value)

// reiniciar paginación cuando cambian filtros o query (señal de verdad)
watch([searchQuery, selectedCategoryId, selectedEntryType, period, sortOrder], () => {
  shownCount.value = pageSize.value
})

// Opciones para selects
const categoryFilterOptions = computed(() => [
  { label: 'Todas las categorías', value: '' },
  ...((expenseStore.activeCategories || []).map(c => ({ label: c.name, value: String(c.id) })))
])

const typeOptions = [
  { label: 'Todos', value: '' },
  { label: 'Cargos', value: 'charge' },
  { label: 'Abonos', value: 'payment' },
  { label: 'Créditos', value: 'credit' }
]

const periodOptions = [
  { label: 'Mes actual', value: 'month' },
  { label: 'Últimos 7 días', value: '7' },
  { label: 'Últimos 30 días', value: '30' },
  { label: 'Todos', value: 'all' }
]

const sortOptions = [
  { label: 'Más recientes primero', value: 'desc' },
  { label: 'Más antiguos primero', value: 'asc' }
]

// Lista base por periodo
const baseByPeriod = computed(() => {
  const all = expenseStore.expenses || []
  const now = new Date()
  if (period.value === '7' || period.value === '30') {
    const days = Number(period.value)
    const cutoff = new Date(now)
    cutoff.setDate(now.getDate() - days)
    return all.filter(e => parseLocalDate(e.date) >= cutoff)
  }
  if (period.value === 'all') return all
  // mes actual
  return currentMonthExpenses.value
})

// (Se redefine más abajo integrando rango personalizado)

// Ordenar y paginar
const sortedExpenses = computed(() => {
  return [...filteredExpenses.value].sort((a, b) => {
    const da = parseLocalDate(a.date).getTime()
    const db = parseLocalDate(b.date).getTime()
    return sortOrder.value === 'asc' ? da - db : db - da
  })
})

const totalFiltered = computed(() => sortedExpenses.value.length)
const pagedExpenses = computed(() => sortedExpenses.value.slice(0, shownCount.value))

const loadingMore = ref(false)
const onLoadMore = async () => {
  if (loadingMore.value) return
  loadingMore.value = true
  // micro delay para ver spinner
  await new Promise(r => setTimeout(r, 350))
  shownCount.value = Math.min(shownCount.value + pageSize.value, totalFiltered.value)
  loadingMore.value = false
}

// Search helpers
const searchInputRef = ref(null)
const searchInput = ref('')
const searchDebounceMs = 400
let searchTimer = null

// Mantener searchQuery como fuente de verdad usada por filtros; searchInput es el campo UI
watch(() => searchInput.value, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    searchQuery.value = searchInput.value
  }, searchDebounceMs)
})

const applySearchNow = () => {
  clearTimeout(searchTimer)
  searchQuery.value = searchInput.value
}

const clearSearch = () => {
  searchInput.value = ''
  applySearchNow()
  // refocus for quick typing
  try { searchInputRef.value?.focus() } catch {}
}

// Chips activos
const activeChips = computed(() => {
  const chips = []
  if (searchQuery.value) chips.push({ key: 'q', label: `Búsqueda: "${searchQuery.value}"`, onClear: () => (searchQuery.value = '') })
  if (selectedCategoryId.value) {
    const cat = expenseStore.activeCategories.find(c => String(c.id) === String(selectedCategoryId.value))
    chips.push({ key: 'cat', label: `Categoría: ${cat ? cat.name : selectedCategoryId.value}`, onClear: () => (selectedCategoryId.value = '') })
  }
  if (selectedEntryType.value) {
    const map = { charge: 'Cargos', payment: 'Abonos', credit: 'Créditos' }
    chips.push({ key: 'type', label: `Tipo: ${map[selectedEntryType.value] || selectedEntryType.value}`, onClear: () => (selectedEntryType.value = '') })
  }
  if (period.value !== 'month') {
    const map = { '7': 'Últimos 7 días', '30': 'Últimos 30 días', all: 'Todos' }
    chips.push({ key: 'period', label: `Periodo: ${map[period.value] || 'Mes actual'}`, onClear: () => (period.value = 'month') })
  }
  if (sortOrder.value !== 'desc') chips.push({ key: 'sort', label: 'Orden: antiguos primero', onClear: () => (sortOrder.value = 'desc') })
  return chips
})

// Estado de filtrado para mostrar skeletons breves
const isFiltering = ref(false)
let filterTimer = null
// micro skeleton al cambiar filtros
watch([searchQuery, selectedCategoryId, selectedEntryType, period, sortOrder], () => {
  isFiltering.value = true
  clearTimeout(filterTimer)
  filterTimer = setTimeout(() => {
    isFiltering.value = false
  }, 180)
})

// Rango de fechas elegante
const showRange = ref(false)
const rangeBtnRef = ref(null)
const rangePopoverRef = ref(null)
const rangeStart = ref(null) // Date|null
const rangeEnd = ref(null)   // Date|null
const tempStart = ref(null)
const tempEnd = ref(null)
const rangeCursor = ref(new Date())

const rangeYear = computed(() => rangeCursor.value.getFullYear())
const rangeMonth = computed(() => rangeCursor.value.getMonth())
const rangeMonthName = computed(() => format(new Date(rangeYear.value, rangeMonth.value, 1), 'MMMM', { locale: es }))

const toggleRange = async () => {
  tempStart.value = rangeStart.value
  tempEnd.value = rangeEnd.value
  showRange.value = !showRange.value
}

const rangePickerStyle = computed(() => {
  if (!rangeBtnRef.value || !showRange.value) return {}
  const rect = rangeBtnRef.value.getBoundingClientRect()
  const top = rect.bottom + 6
  const left = Math.min(rect.left, window.innerWidth - 340)
  return { top: `${top}px`, left: `${left}px` }
})

const rangePrevMonth = () => {
  const d = new Date(rangeCursor.value)
  d.setMonth(d.getMonth() - 1)
  rangeCursor.value = d
}
const rangeNextMonth = () => {
  const d = new Date(rangeCursor.value)
  d.setMonth(d.getMonth() + 1)
  rangeCursor.value = d
}

const rangeCalendarDays = computed(() => {
  const y = rangeYear.value
  const m = rangeMonth.value
  const first = new Date(y, m, 1)
  const start = new Date(first)
  start.setDate(first.getDate() - first.getDay())
  const days = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const isCurrentMonth = d.getMonth() === m
    const inRange = tempStart.value && tempEnd.value && d >= tempStart.value && d <= tempEnd.value
    const isStart = tempStart.value && d.toDateString() === tempStart.value.toDateString()
    const isEnd = tempEnd.value && d.toDateString() === tempEnd.value.toDateString()
    days.push({
      date: new Date(d),
      day: d.getDate(),
      isCurrentMonth,
      isInRange: !!inRange,
      isStart: !!isStart,
      isEnd: !!isEnd
    })
  }
  return days
})

const onPick = (date) => {
  if (!tempStart.value || (tempStart.value && tempEnd.value)) {
    tempStart.value = new Date(date)
    tempEnd.value = null
    return
  }
  // picking end
  if (new Date(date) < tempStart.value) {
    tempEnd.value = tempStart.value
    tempStart.value = new Date(date)
  } else {
    tempEnd.value = new Date(date)
  }
}

const clearRange = () => {
  tempStart.value = null
  tempEnd.value = null
}

const applyRange = () => {
  rangeStart.value = tempStart.value
  rangeEnd.value = tempEnd.value
  showRange.value = false
}

// Cerrar al hacer clic fuera o con Escape
const onGlobalPointerDown = (event) => {
  if (!showRange.value) return
  const target = event.target
  const pop = rangePopoverRef.value
  const btn = rangeBtnRef.value
  if ((pop && pop.contains(target)) || (btn && btn.contains(target))) return
  showRange.value = false
}

const onGlobalKeyDown = (event) => {
  if (!showRange.value) return
  if (event.key === 'Escape') showRange.value = false
}

onMounted(() => {
  document.addEventListener('mousedown', onGlobalPointerDown)
  document.addEventListener('keydown', onGlobalKeyDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onGlobalPointerDown)
  document.removeEventListener('keydown', onGlobalKeyDown)
})

const rangeLabel = computed(() => {
  if (rangeStart.value && rangeEnd.value) {
    return `${format(rangeStart.value, 'dd/MM/yyyy')} - ${format(rangeEnd.value, 'dd/MM/yyyy')}`
  }
  return 'Rango personalizado'
})

// Aplicar rango al filtrar
watch([rangeStart, rangeEnd], () => {
  if (rangeStart.value && rangeEnd.value) {
    period.value = 'custom'
  } else if (!rangeStart.value && !rangeEnd.value && period.value === 'custom') {
    period.value = 'month'
  }
  shownCount.value = pageSize.value
})

// Integrar rango en baseByPeriod
const _baseByPeriodOrig = baseByPeriod
const baseByPeriodWithRange = computed(() => {
  // si hay rango, priorizarlo
  if (period.value === 'custom' && rangeStart.value && rangeEnd.value) {
    const all = expenseStore.expenses || []
    return all.filter(e => {
      const d = parseLocalDate(e.date)
      return d >= rangeStart.value && d <= rangeEnd.value
    })
  }
  return _baseByPeriodOrig.value
})

// Reemplazar usos siguientes
const filteredExpenses = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const cat = selectedCategoryId.value
  return baseByPeriodWithRange.value.filter(e => {
    const matchesCat = !cat || String(e.categoryId) === String(cat)
    const matchesSearch = !query || (e.description || '').toLowerCase().includes(query)
    const matchesType = !selectedEntryType.value
      || (selectedEntryType.value === 'credit' ? isCreditPayment(e) : (String(e.entryType || '').toLowerCase() === selectedEntryType.value))
    return matchesCat && matchesSearch && matchesType
  })
})

// Agrupar por fecha (día)
const groupedPagedExpenses = computed(() => {
  const groups = {}
  for (const e of pagedExpenses.value) {
    const d = parseLocalDate(e.date)
    const key = format(d, 'yyyy-MM-dd')
    if (!groups[key]) groups[key] = []
    groups[key].push(e)
  }
  return Object.keys(groups)
    .sort((a, b) => (sortOrder.value === 'asc' ? a.localeCompare(b) : b.localeCompare(a)))
    .map(key => ({
      key,
      label: format(parseLocalDate(key), 'EEEE d \"de\" MMMM', { locale: es }),
      items: groups[key]
    }))
})

// Handlers
const onEdit = (expense) => emit('edit-expense', expense)
const onDelete = async (expense) => {
  const ok = await confirm.show({
    title: 'Eliminar gasto',
    message: '¿Eliminar este gasto? Esta acción no se puede deshacer.',
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    variant: 'danger'
  })
  if (!ok) return
  try {
    await expenseStore.deleteExpense(expense.id)
    notify.success('Gasto eliminado')
  } catch (e) {
    notify.error('No se pudo eliminar el gasto')
  }
}
</script>
