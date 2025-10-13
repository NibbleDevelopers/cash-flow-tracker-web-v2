import { ref, computed, watch, nextTick } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { parseLocalDate } from '../utils/date'

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
  
  // Rango de fechas
  const showRange = ref(false)
  const rangeBtnRef = ref(null) // Botón desktop
  const rangeBtnRefMobile = ref(null) // Botón mobile
  const rangePopoverRef = ref(null)
  const rangeStart = ref(null)
  const rangeEnd = ref(null)
  const tempStart = ref(null)
  const tempEnd = ref(null)
  const rangeCursor = ref(new Date())
  const autoSingleDay = ref(false)
  
  // Computed que devuelve la ref correcta según el tamaño de pantalla
  const activeRangeBtnRef = computed(() => {
    // En mobile, usar mobile si existe, si no usar desktop
    // En desktop, usar desktop
    if (window.innerWidth < 640) {
      return rangeBtnRefMobile.value || rangeBtnRef.value
    }
    return rangeBtnRef.value
  })
  
  // Paginación
  const pageSize = ref(10)
  const shownCount = ref(pageSize.value)
  
  // Búsqueda con sugerencias
  const showSuggestions = ref(false)
  const searchSuggestions = ref([])
  const searchInputRef = ref(null)
  
  // Computeds del calendario
  const rangeYear = computed(() => rangeCursor.value.getFullYear())
  const rangeMonth = computed(() => rangeCursor.value.getMonth())
  const rangeMonthName = computed(() => format(new Date(rangeYear.value, rangeMonth.value, 1), 'MMMM', { locale: es }))
  
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
    if (period.value === 'custom' && rangeStart.value) {
      const all = expenseStore.expenses || []
      const start = rangeStart.value
      const end = rangeEnd.value || rangeStart.value
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
  
  watch([rangeStart, rangeEnd], () => {
    if (rangeStart.value) {
      period.value = 'custom'
    } else if (!rangeStart.value && !rangeEnd.value && period.value === 'custom') {
      period.value = 'month'
    }
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
    rangeStart.value = null
    rangeEnd.value = null
    tempStart.value = null
    tempEnd.value = null
    showRange.value = false
  }
  
  const toggleRange = async () => {
    if (!showRange.value) {
      document.body.style.overflow = 'hidden'
      
      if (!rangeStart.value && !rangeEnd.value) {
        const today = new Date()
        const normalized = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        tempStart.value = normalized
        tempEnd.value = null
        rangeCursor.value = normalized
        autoSingleDay.value = true
      } else {
        tempStart.value = rangeStart.value
        tempEnd.value = rangeEnd.value
        if (tempStart.value) {
          rangeCursor.value = new Date(tempStart.value)
        }
        autoSingleDay.value = true
      }
    } else {
      document.body.style.overflow = ''
    }
    showRange.value = !showRange.value
  }
  
  const applyRange = () => {
    if (tempStart.value && !tempEnd.value) {
      rangeStart.value = tempStart.value
      rangeEnd.value = tempStart.value
    } else {
      rangeStart.value = tempStart.value
      rangeEnd.value = tempEnd.value
    }
    showRange.value = false
    document.body.style.overflow = ''
  }
  
  const clearRange = () => {
    tempStart.value = null
    tempEnd.value = null
    showRange.value = false
    document.body.style.overflow = ''
  }
  
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
    // Simplemente usar onPick normal, sin auto-aplicación
    // El usuario debe hacer clic en "Aplicar" explícitamente
    onPick(date)
    autoSingleDay.value = false
  }
  
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
  
  const rangePickerStyle = computed(() => {
    if (!showRange.value) return {}
    
    const btnRef = activeRangeBtnRef.value
    const calendarWidth = window.innerWidth < 640 ? 320 : 300
    const calendarHeight = window.innerWidth < 640 ? 400 : 280
    
    // Si no hay botón de referencia (ej: abierto desde botón +), centrar en pantalla
    if (!btnRef) {
      const left = (window.innerWidth - calendarWidth) / 2
      const top = (window.innerHeight - calendarHeight) / 2
      return {
        top: `${Math.max(16, top)}px`,
        left: `${Math.max(16, left)}px`
      }
    }
    
    // Si hay botón de referencia, posicionar relativo a él
    const rect = btnRef.getBoundingClientRect()
    const left = Math.max(16, Math.min(rect.left, window.innerWidth - calendarWidth - 16))
    
    let top
    if (window.innerWidth < 640) {
      const spaceAbove = rect.top
      const spaceBelow = window.innerHeight - rect.bottom
      top = spaceAbove > calendarHeight + 16 
        ? rect.top - calendarHeight - 8
        : rect.bottom + 8
    } else {
      top = rect.bottom + 4
    }
    
    return { 
      top: `${Math.max(16, Math.min(top, window.innerHeight - calendarHeight - 16))}px`, 
      left: `${left}px` 
    }
  })
  
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
    showRange,
    rangeBtnRef,
    rangeBtnRefMobile,
    rangePopoverRef,
    rangeStart,
    rangeEnd,
    tempStart,
    tempEnd,
    rangeCursor,
    autoSingleDay,
    pageSize,
    shownCount,
    showSuggestions,
    searchSuggestions,
    searchInputRef,
    
    // Computeds
    rangeYear,
    rangeMonth,
    rangeMonthName,
    rangeLabel,
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
    rangeCalendarDays,
    rangePickerStyle,
    
    // Funciones
    isCreditPayment,
    clearAllFilters,
    toggleRange,
    applyRange,
    clearRange,
    rangePrevMonth,
    rangeNextMonth,
    onPick,
    onPickWithAuto,
    applyPreset,
    applySearchNow,
    clearSearch
  }
}

