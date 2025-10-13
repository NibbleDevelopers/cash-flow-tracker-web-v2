import { ref, computed, watch, nextTick } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { parseLocalDate } from '../utils/date'
import { useDateRangePicker } from './useDateRangePicker'

export function useExpenseFilters(expenseStore) {
  // Estado de filtros
  const searchQuery = ref('')
  const searchInput = ref('')
  const selectedCategoryId = ref('')
  const selectedEntryType = ref('') // '' | 'charge' | 'payment'
  const selectedStatus = ref('') // '' | 'pending' | 'paid'
  const period = ref('month') // month | 7 | 30 | all | custom
  const sortOrder = ref('desc') // desc | asc
  
  // Estado del acordeón de filtros (solo mobile)
  const filtersExpanded = ref(false)
  
  // Estado de filtrado (para skeletons)
  const isFiltering = ref(false)
  let filterTimer = null
  
  // Paginación
  const pageSize = ref(10)
  const shownCount = ref(pageSize.value)
  
  // Búsqueda con sugerencias
  const showSuggestions = ref(false)
  const searchSuggestions = ref([])
  const searchInputRef = ref(null)
  
  // Date Range Picker - Composable reutilizable
  const dateRangePicker = useDateRangePicker({
    onApply: ({ start, end }) => {
      // Actualizar el período cuando se aplica el rango
      if (start) {
        period.value = 'custom'
      } else {
        period.value = 'month'
      }
    }
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
  
  // Función para identificar gastos de crédito
  const isCreditPayment = (expense) => {
    if (expense?.debtId) return true
    const categoryName = expense.category?.name?.toLowerCase() || ''
    if (categoryName === 'crédito' || categoryName === 'credito') return true
    const description = expense.description?.toLowerCase() || ''
    if (description.includes('cuota') && (description.includes('crédito') || description.includes('credito'))) return true
    return false
  }
  
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
    return expenseStore.currentMonthExpenses
  })
  
  // Integrar rango personalizado
  const baseByPeriodWithRange = computed(() => {
    // si hay rango, priorizarlo; si solo hay inicio, usarlo como fin también
    if (period.value === 'custom' && dateRangePicker.rangeStart.value) {
      const all = expenseStore.expenses || []
      const start = dateRangePicker.rangeStart.value
      const end = dateRangePicker.rangeEnd.value || dateRangePicker.rangeStart.value
      return all.filter(e => {
        const d = parseLocalDate(e.date)
        return d >= start && d <= end
      })
    }
    return baseByPeriod.value
  })
  
  // Filtrar por categoría, búsqueda, tipo, estado
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
  
  // Ordenar
  const sortedExpenses = computed(() => {
    return [...filteredExpenses.value].sort((a, b) => {
      const da = parseLocalDate(a.date).getTime()
      const db = parseLocalDate(b.date).getTime()
      return sortOrder.value === 'asc' ? da - db : db - da
    })
  })
  
  // Paginar
  const totalFiltered = computed(() => sortedExpenses.value.length)
  const pagedExpenses = computed(() => sortedExpenses.value.slice(0, shownCount.value))
  
  // Agrupar por fecha
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
        label: format(parseLocalDate(key), 'EEEE d "de" MMMM', { locale: es }),
        items: groups[key]
      }))
  })
  
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
      const map = { '7': 'Últimos 7 días', '30': 'Últimos 30 días', all: 'Todos', custom: 'Rango personalizado' }
      chips.push({ key: 'period', label: `Periodo: ${map[period.value] || 'Mes actual'}`, onClear: () => (period.value = 'month') })
    }
    if (sortOrder.value !== 'desc') chips.push({ key: 'sort', label: 'Orden: antiguos primero', onClear: () => (sortOrder.value = 'desc') })
    return chips
  })
  
  const hasActiveFilters = computed(() => activeChips.value.length > 0)
  
  // Watches
  watch([searchQuery, selectedCategoryId, selectedEntryType, selectedStatus, period, sortOrder], (newVals, oldVals) => {
    shownCount.value = pageSize.value
    
    // Cerrar acordeón en mobile cuando se aplica un filtro
    // EXCEPTO cuando solo cambia period a 'custom' (filtro de rango)
    if (window.innerWidth < 640) {
      const oldPeriod = oldVals ? oldVals[4] : null
      const newPeriod = newVals[4]
      
      // NO cerrar si solo cambió period a 'custom'
      if (newPeriod === 'custom' && oldPeriod !== 'custom') {
        return
      }
      
      filtersExpanded.value = false
    }
  })
  
  watch([searchQuery, selectedCategoryId, selectedEntryType, period, sortOrder], () => {
    isFiltering.value = true
    clearTimeout(filterTimer)
    filterTimer = setTimeout(() => {
      isFiltering.value = false
    }, 180)
  })
  
  watch([() => dateRangePicker.rangeStart.value, () => dateRangePicker.rangeEnd.value], () => {
    shownCount.value = pageSize.value
  })
  
  // Resetear estado si el tipo ya no es "payment"
  watch(() => selectedEntryType.value, (val) => {
    if (val !== 'payment') selectedStatus.value = ''
  })
  
  // Funciones
  const clearAllFilters = () => {
    searchInput.value = ''
    searchQuery.value = ''
    selectedCategoryId.value = ''
    selectedEntryType.value = ''
    selectedStatus.value = ''
    period.value = 'month'
    sortOrder.value = 'desc'
    dateRangePicker.clearRange()
  }
  
  // Funciones de búsqueda
  const searchDebounceMs = 400
  let searchTimer = null
  
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
    showSuggestions.value = false
    try { searchInputRef.value?.focus() } catch {}
  }
  
  
  return {
    // Estado
    searchQuery,
    searchInput,
    selectedCategoryId,
    selectedEntryType,
    selectedStatus,
    period,
    sortOrder,
    filtersExpanded,
    isFiltering,
    pageSize,
    shownCount,
    showSuggestions,
    searchSuggestions,
    searchInputRef,
    
    // Date Range Picker - Exportando del composable
    showRange: dateRangePicker.showRange,
    rangeBtnRef: dateRangePicker.rangeBtnRef,
    rangeBtnRefMobile: dateRangePicker.rangeBtnRefMobile,
    rangeStart: dateRangePicker.rangeStart,
    rangeEnd: dateRangePicker.rangeEnd,
    tempStart: dateRangePicker.tempStart,
    tempEnd: dateRangePicker.tempEnd,
    rangeCursor: dateRangePicker.rangeCursor,
    autoSingleDay: dateRangePicker.autoSingleDay,
    rangeYear: dateRangePicker.rangeYear,
    rangeMonth: dateRangePicker.rangeMonth,
    rangeMonthName: dateRangePicker.rangeMonthName,
    rangeLabel: dateRangePicker.rangeLabel,
    rangeCalendarDays: dateRangePicker.rangeCalendarDays,
    rangePickerStyle: dateRangePicker.rangePickerStyle,
    
    // Computeds
    categoryFilterOptions,
    typeOptions,
    statusFilterOptions,
    periodOptions,
    sortOptions,
    filteredExpenses,
    sortedExpenses,
    totalFiltered,
    pagedExpenses,
    groupedPagedExpenses,
    activeChips,
    hasActiveFilters,
    
    // Funciones
    isCreditPayment,
    clearAllFilters,
    applySearchNow,
    clearSearch,
    
    // Date Range Picker Functions
    toggleRange: dateRangePicker.toggleRange,
    applyRange: dateRangePicker.applyRange,
    clearRange: dateRangePicker.clearRange,
    rangePrevMonth: dateRangePicker.rangePrevMonth,
    rangeNextMonth: dateRangePicker.rangeNextMonth,
    onPick: dateRangePicker.onPick,
    onPickWithAuto: dateRangePicker.onPickWithAuto,
    applyPreset: dateRangePicker.applyPreset
  }
}

