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

      <!-- Fila 2: Categoría, Tipo y Estado (alineados) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <div class="flex flex-col" :class="selectedEntryType !== 'payment' ? 'opacity-50' : ''" :aria-disabled="selectedEntryType !== 'payment'">
          <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
          <AppSelect
            v-model="selectedStatus"
            :options="statusFilterOptions"
            placeholder="Todos los estados"
            class="h-10"
            :disabled="selectedEntryType !== 'payment'"
            :title="selectedEntryType !== 'payment' ? 'Disponible al seleccionar Abonos' : ''"
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
            <button class="px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200" @click="applyPreset('today')">Hoy</button>
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
              @click="onPickWithAuto(day.date)"
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

      <!-- Contador y acción -->
      <div class="flex items-center justify-between text-xs text-gray-500 mb-2" v-else>
        <span>Mostrando {{ Math.min(shownCount, totalFiltered) }} de {{ totalFiltered }}</span>
        <button
          v-if="hasActiveFilters"
          type="button"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
          @click="clearAllFilters"
          title="Limpiar filtros"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          Limpiar
        </button>
      </div>

      <!-- Lista agrupada por fecha -->
      <transition-group name="fade" tag="div" class="space-y-4" v-if="!isFiltering">
        <div v-for="group in groupedPagedExpenses" :key="group.key" class="space-y-2">
          <div class="sticky top-16 bg-white/70 backdrop-blur text-xs text-gray-600 font-medium px-1">{{ group.label }}</div>
          <ExpenseCard
            v-for="expense in group.items"
            :key="expense.id"
            :expense="expense"
            @edit="onEdit"
            @delete="onDelete"
          />
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

    <div v-if="filteredExpenses.length > 0 && !isFiltering" class="mt-6 pt-4 border-t border-gray-200">
      <div class="flex justify-between items-center">
        <span class="text-sm font-medium text-gray-700">Total:</span>
        <span class="text-lg font-bold text-gray-900">
          ${{ filteredTotalsSimple.totalAll.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
        </span>
      </div>

      <div class="mt-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xs uppercase tracking-wide text-gray-500">Desglose</span>
          </div>
        </div>

        <div class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <!-- Cargos crédito -->
          <div class="p-3 rounded-lg border border-purple-200 bg-purple-50 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-purple-500"></span>
              <span class="text-xs text-purple-800">Cargos de crédito</span>
            </div>
            <div class="text-right">
              <div class="text-sm font-semibold text-purple-900">${{ filteredTotalsSimple.charges.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}</div>
            </div>
          </div>

          <!-- Abonos pagados -->
          <div class="p-3 rounded-lg border border-emerald-200 bg-emerald-50 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              <span class="text-xs text-emerald-800">Abonos pagados</span>
            </div>
            <div class="text-right">
              <div class="text-sm font-semibold text-emerald-900">${{ filteredTotalsSimple.paymentsPaid.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}</div>
            </div>
          </div>

          <!-- Abonos pendientes -->
          <div class="p-3 rounded-lg border border-amber-200 bg-amber-50 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
              <span class="text-xs text-amber-800">Abonos pendientes</span>
            </div>
            <div class="text-right">
              <div class="text-sm font-semibold text-amber-900">${{ filteredTotalsSimple.paymentsPending.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}</div>
            </div>
          </div>

          <!-- Total sin abonos pendientes -->
          <div class="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-slate-500"></span>
              <span class="text-xs text-slate-800">Total sin abonos pendientes</span>
            </div>
            <div class="text-right">
              <div class="text-sm font-semibold text-slate-900">${{ filteredTotalsSimple.totalNet.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}</div>
            </div>
          </div>
        </div>
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
import ExpenseCard from './ExpenseCard.vue'

const expenseStore = useExpenseStore()
const confirm = useConfirm()
const emit = defineEmits(['edit-expense', 'delete-expense'])

const currentMonthExpenses = computed(() => expenseStore.currentMonthExpenses)
const totalSpent = computed(() => expenseStore.totalSpent)
const filteredTotalAmount = computed(() => {
  return filteredExpenses.value
    .filter(e => {
      const credit = isCreditPayment(e)
      if (!credit) return true
      const type = String(e?.entryType || '').toLowerCase()
      const status = String(e?.status || '').toLowerCase()
      if (type === 'payment') {
        return status !== 'pending'
      }
      // Si es crédito sin entryType o es 'charge', no impacta presupuesto
      return false
    })
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
})

// Totales desglosados del conjunto filtrado (sin excluir nada para el total general)
const filteredTotals = computed(() => {
  const all = filteredExpenses.value
  let normal = 0
  let charges = 0
  let paymentsPaid = 0
  let paymentsPending = 0
  for (const e of all) {
    const credit = isCreditPayment(e)
    const type = String(e?.entryType || '').toLowerCase()
    const status = String(e?.status || '').toLowerCase()
    const amount = Number(e.amount) || 0
    if (!credit) {
      normal += amount
      continue
    }
    if (type === 'payment') {
      if (status === 'pending') paymentsPending += amount
      else paymentsPaid += amount
      continue
    }
    // Si es crédito y no es 'payment', contarlo como cargo
    charges += amount
  }
  const allTotal = normal + charges + paymentsPaid + paymentsPending
  return { all: allTotal, normal, charges, paymentsPaid, paymentsPending }
})

// Totales del periodo (ignorando filtros; respeta periodo/rango seleccionado)
const periodTotals = computed(() => {
  const base = baseByPeriodWithRange.value
  let normal = 0
  let charges = 0
  let paymentsPaid = 0
  let paymentsPending = 0
  for (const e of base) {
    const credit = isCreditPayment(e)
    const type = String(e?.entryType || '').toLowerCase()
    const status = String(e?.status || '').toLowerCase()
    const amount = Number(e.amount) || 0
    if (!credit) {
      normal += amount
      continue
    }
    if (type === 'payment') {
      if (status === 'pending') paymentsPending += amount
      else paymentsPaid += amount
      continue
    }
    charges += amount
  }
  const all = normal + charges + paymentsPaid + paymentsPending
  return { all, normal, charges, paymentsPaid, paymentsPending }
})

// Totales simples basados en el resultado filtrado (para mostrar lo pedido)
const filteredTotalsSimple = computed(() => {
  const all = filteredExpenses.value
  let charges = 0
  let paymentsPaid = 0
  let paymentsPending = 0
  for (const e of all) {
    const credit = isCreditPayment(e)
    const type = String(e?.entryType || '').toLowerCase()
    const status = String(e?.status || '').toLowerCase()
    const amount = Number(e.amount) || 0
    if (credit && type === 'payment') {
      if (status === 'pending') paymentsPending += amount
      else paymentsPaid += amount
    } else if (credit && type !== 'payment') {
      charges += amount
    }
  }
  const totalAll = all.reduce((s, e) => s + (Number(e.amount) || 0), 0)
  const totalNet = totalAll - paymentsPending
  return { totalAll, charges, paymentsPaid, paymentsPending, totalNet }
})
const loading = computed(() => expenseStore.loading)

// Cargar gastos fijos cuando se monta el componente
onMounted(async () => {
  await expenseStore.loadFixedExpenses()
})

// Función para obtener el día del mes de un gasto fijo
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
const selectedStatus = ref('') // '' | 'pending' | 'paid' (solo aplica si entryType === 'payment')
const period = ref('month') // month | 7 | 30 | all
const sortOrder = ref('desc') // desc | asc
const pageSize = ref(10)
const shownCount = ref(pageSize.value)

// reiniciar paginación cuando cambian filtros o query (señal de verdad)
watch([searchQuery, selectedCategoryId, selectedEntryType, selectedStatus, period, sortOrder], () => {
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

const statusFilterOptions = [
  { label: 'Todos', value: '' },
  { label: 'Pagado', value: 'paid' },
  { label: 'Pendiente', value: 'pending' }
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
  if (selectedEntryType.value === 'payment' && selectedStatus.value) {
    const map = { paid: 'Pagado', pending: 'Pendiente' }
    chips.push({ key: 'status', label: `Estado: ${map[selectedStatus.value] || selectedStatus.value}`, onClear: () => (selectedStatus.value = '') })
  }
  if (period.value !== 'month') {
    const map = { '7': 'Últimos 7 días', '30': 'Últimos 30 días', all: 'Todos' }
    chips.push({ key: 'period', label: `Periodo: ${map[period.value] || 'Mes actual'}`, onClear: () => (period.value = 'month') })
  }
  if (sortOrder.value !== 'desc') chips.push({ key: 'sort', label: 'Orden: antiguos primero', onClear: () => (sortOrder.value = 'desc') })
  return chips
})

const hasActiveFilters = computed(() => activeChips.value.length > 0)

const clearAllFilters = () => {
  searchInput.value = ''
  searchQuery.value = ''
  selectedCategoryId.value = ''
  selectedEntryType.value = ''
  selectedStatus.value = ''
  period.value = 'month'
  sortOrder.value = 'desc'
  // limpiar rango personalizado
  rangeStart.value = null
  rangeEnd.value = null
  tempStart.value = null
  tempEnd.value = null
  showRange.value = false
}

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

const autoSingleDay = ref(false)

const toggleRange = async () => {
  // Si vamos a abrir el popover, preseleccionar hoy si no hay rango previo
  if (!showRange.value) {
    if (!rangeStart.value && !rangeEnd.value) {
      const today = new Date()
      // Normalizar a medianoche
      const normalized = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      tempStart.value = normalized
      tempEnd.value = null
      rangeCursor.value = normalized
      autoSingleDay.value = true
    } else {
      tempStart.value = rangeStart.value
      tempEnd.value = rangeEnd.value
      // Centrar el cursor en el mes del inicio seleccionado
      if (tempStart.value) {
        rangeCursor.value = new Date(tempStart.value)
      }
      autoSingleDay.value = true
    }
  }
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

// Presets de rango
const applyPreset = (preset) => {
  const today = new Date()
  const startOf = (date) => new Date(date.getFullYear(), date.getMonth(), 1)
  const endOf = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0)

  let start = null
  let end = null

  if (preset === '7') {
    end = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    start = new Date(end)
    start.setDate(end.getDate() - 6)
  } else if (preset === '30') {
    end = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    start = new Date(end)
    start.setDate(end.getDate() - 29)
  } else if (preset === 'thisMonth') {
    start = startOf(today)
    end = endOf(today)
  } else if (preset === 'lastMonth') {
    const last = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    start = startOf(last)
    end = endOf(last)
  } else if (preset === 'today') {
    start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    end = start
  }

  tempStart.value = start
  tempEnd.value = end
  applyRange()
}

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

const onPickWithAuto = (date) => {
  const picked = new Date(date)
  // Auto-aplicar solo si había un inicio ya seleccionado y coincide con el clic,
  // y el modo autoSingleDay está activo (primer clic tras abrir)
  if (autoSingleDay.value && tempStart.value && !tempEnd.value && picked.toDateString() === tempStart.value.toDateString()) {
    applyRange()
    autoSingleDay.value = false
    return
  }
  // Comportamiento normal de selección (inicio/fin)
  onPick(date)
  // Tras cualquier selección manual, desactivar auto-aplicación
  autoSingleDay.value = false
}

const clearRange = () => {
  tempStart.value = null
  tempEnd.value = null
}

const applyRange = () => {
  // Permitir selección de un solo día: si no hay fin, usar el inicio como fin
  if (tempStart.value && !tempEnd.value) {
    rangeStart.value = tempStart.value
    rangeEnd.value = tempStart.value
  } else {
    rangeStart.value = tempStart.value
    rangeEnd.value = tempEnd.value
  }
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
    const sameDay = rangeStart.value.toDateString() === rangeEnd.value.toDateString()
    if (sameDay) return `${format(rangeStart.value, 'dd/MM/yyyy')}`
    return `${format(rangeStart.value, 'dd/MM/yyyy')} - ${format(rangeEnd.value, 'dd/MM/yyyy')}`
  }
  if (rangeStart.value && !rangeEnd.value) {
    return `${format(rangeStart.value, 'dd/MM/yyyy')}`
  }
  return 'Rango personalizado'
})

// Aplicar rango al filtrar (admite un solo día)
watch([rangeStart, rangeEnd], () => {
  if (rangeStart.value) {
    period.value = 'custom'
  } else if (!rangeStart.value && !rangeEnd.value && period.value === 'custom') {
    period.value = 'month'
  }
  shownCount.value = pageSize.value
})

// Integrar rango en baseByPeriod
const _baseByPeriodOrig = baseByPeriod
const baseByPeriodWithRange = computed(() => {
  // si hay rango, priorizarlo; si solo hay inicio, usarlo como fin también
  if (period.value === 'custom' && rangeStart.value) {
    const all = expenseStore.expenses || []
    const start = rangeStart.value
    const end = rangeEnd.value || rangeStart.value
    return all.filter(e => {
      const d = parseLocalDate(e.date)
      return d >= start && d <= end
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
    const matchesStatus = !(selectedEntryType.value === 'payment' && selectedStatus.value)
      || (String(e.status || '').toLowerCase() === selectedStatus.value)
    return matchesCat && matchesSearch && matchesType && matchesStatus
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

// Resetear estado si el tipo ya no es "payment"
watch(() => selectedEntryType.value, (val) => {
  if (val !== 'payment') selectedStatus.value = ''
})
</script>
