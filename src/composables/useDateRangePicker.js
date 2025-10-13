import { ref, computed } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Composable reutilizable para selección de rangos de fechas
 * 
 * @param {Object} options - Opciones de configuración
 * @param {Function} options.onApply - Callback cuando se aplica el rango
 * @returns {Object} Estado y funciones del date range picker
 */
export function useDateRangePicker(options = {}) {
  const { onApply } = options
  
  // Estado del picker
  const showRange = ref(false)
  const rangeStart = ref(null)
  const rangeEnd = ref(null)
  const tempStart = ref(null)
  const tempEnd = ref(null)
  const rangeCursor = ref(new Date())
  const autoSingleDay = ref(false)
  
  // Referencias a botones (para posicionar el popover)
  const rangeBtnRef = ref(null)
  const rangeBtnRefMobile = ref(null)
  
  // Computed que devuelve la ref correcta según el tamaño de pantalla
  const activeRangeBtnRef = computed(() => {
    if (window.innerWidth < 640) {
      return rangeBtnRefMobile.value || rangeBtnRef.value
    }
    return rangeBtnRef.value
  })
  
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
    
    // Si no hay botón de referencia, centrar en pantalla
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
  
  // Funciones
  const toggleRange = () => {
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
    
    // Llamar al callback si existe
    if (onApply && typeof onApply === 'function') {
      onApply({ start: rangeStart.value, end: rangeEnd.value })
    }
  }
  
  const clearRange = () => {
    tempStart.value = null
    tempEnd.value = null
    rangeStart.value = null
    rangeEnd.value = null
    showRange.value = false
    document.body.style.overflow = ''
    
    // Llamar al callback con valores null
    if (onApply && typeof onApply === 'function') {
      onApply({ start: null, end: null })
    }
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
  
  return {
    // Estado
    showRange,
    rangeStart,
    rangeEnd,
    tempStart,
    tempEnd,
    rangeCursor,
    autoSingleDay,
    rangeBtnRef,
    rangeBtnRefMobile,
    
    // Computeds
    rangeYear,
    rangeMonth,
    rangeMonthName,
    rangeLabel,
    rangeCalendarDays,
    rangePickerStyle,
    
    // Funciones
    toggleRange,
    applyRange,
    clearRange,
    rangePrevMonth,
    rangeNextMonth,
    onPick,
    onPickWithAuto,
    applyPreset
  }
}

