<template>
  <div class="relative inline-block datepicker-container">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">{{ label }}</label>
    <div class="relative">
      <input
        ref="inputRef"
        :id="props.id"
        type="text"
        class="input-field h-10 cursor-pointer pr-9 focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
        :value="displayValue"
        readonly
        @click="togglePanel"
        :aria-label="ariaLabel || (isMonthMode ? 'Seleccionar mes' : 'Seleccionar fecha')"
      />
      <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>

    <Teleport to="body">
      <Transition
        enter-active-class="ease-out duration-200"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="ease-in duration-150"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-if="show">
          <!-- Overlay for mobile -->
          <div v-if="isMobile" class="fixed inset-0 z-[75] bg-black/30" @click="show = false"></div>

          <!-- Mobile panel (bottom sheet) -->
          <div
            v-if="isMobile"
            data-datepicker
            class="fixed inset-x-0 bottom-0 z-[80] bg-white rounded-t-xl shadow-2xl max-h-[80vh] overflow-hidden"
            @click.stop
          >
            <div class="p-4">
              <!-- Month mode -->
              <template v-if="isMonthMode">
                <div class="flex items-center justify-between px-3 py-2 bg-white rounded-t-xl border-b border-gray-100">
                  <button @click="prevYear" class="p-2 hover:bg-gray-100 rounded-md text-primary-700">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h3 class="text-lg font-semibold text-gray-900">{{ currentYear }}</h3>
                  <button @click="nextYear" class="p-2 hover:bg-gray-100 rounded-md text-primary-700">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <div class="grid grid-cols-3 gap-2 p-3">
                  <button
                    v-for="month in months"
                    :key="month.value"
                    @click="selectCurrentMonth(month.value)"
                    :class="monthClass(month.value)"
                  >
                    {{ month.name }}
                  </button>
                </div>
              </template>

              <!-- Date mode -->
              <template v-else>
                <div class="flex items-center justify-between px-3 py-2 bg-white rounded-t-xl border-b border-gray-100">
                  <button @click="previousMonth" class="p-2 hover:bg-gray-100 rounded-md text-primary-700">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h3 class="text-lg font-semibold text-gray-900">{{ format(currentDate, 'MMMM yyyy', { locale: es }) }}</h3>
                  <button @click="nextMonth" class="p-2 hover:bg-gray-100 rounded-md text-primary-700">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <div class="px-3 py-2">
                  <div class="grid grid-cols-7 gap-1 mb-2">
                    <div v-for="day in ['L', 'M', 'X', 'J', 'V', 'S', 'D']" :key="day" class="h-8 w-8 flex items-center justify-center text-xs font-medium text-gray-500">
                      {{ day }}
                    </div>
                  </div>
                  <div class="grid grid-cols-7 gap-1">
                    <button
                      v-for="day in calendarDays"
                      :key="`${day.date}-mobile`"
                      @click="selectDate(day.date)"
                      :class="[
                        'h-12 w-12 rounded-full text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/40',
                        day.isCurrentMonth ? 'text-gray-700 hover:bg-primary-100' : 'text-gray-400',
                        day.isToday ? 'bg-primary-600 text-white hover:bg-primary-700' : '',
                        day.isSelected ? 'bg-primary-100 text-primary-900 ring-2 ring-primary-500' : ''
                      ]"
                    >
                      {{ day.day }}
                    </button>
                  </div>
                </div>
                <div class="flex justify-between px-4 py-3 border-t border-gray-200 rounded-b-2xl bg-white">
                  <div class="space-x-2">
                    <button @click="selectYesterday" class="px-3 py-2 text-sm text-primary-600 hover:text-primary-700 font-medium">Ayer</button>
                    <button @click="selectToday" class="px-3 py-2 text-sm text-primary-600 hover:text-primary-700 font-medium">Hoy</button>
                    <button @click="selectTomorrow" class="px-3 py-2 text-sm text-primary-600 hover:text-primary-700 font-medium">Mañana</button>
                  </div>
                  <button @click="show = false" class="px-3 py-2 text-sm text-gray-600 hover:text-gray-700 font-medium">Cerrar</button>
                </div>
              </template>
            </div>
          </div>

          <!-- Desktop panel -->
          <div
            v-if="!isMobile"
            data-datepicker
            class="fixed z-[80] bg-white border border-gray-100 rounded-xl shadow-2xl w-[300px]"
            :style="panelStyle"
            @click.stop
          >
            <div class="p-0">
              <!-- Month mode -->
              <template v-if="isMonthMode">
                <div class="flex items-center justify-between px-3 py-2 bg-white rounded-t-xl border-b border-gray-100">
                  <button @click="prevYear" class="p-1 hover:bg-gray-100 rounded-md text-primary-700">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h3 class="text-xs font-semibold text-gray-900">{{ displayYear }}</h3>
                  <button @click="nextYear" class="p-1 hover:bg-gray-100 rounded-md text-primary-700">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <div class="grid grid-cols-3 gap-1.5 p-3">
                  <button
                    v-for="(m, idx) in months"
                    :key="m.value"
                    @click="selectMonth(idx)"
                    :class="monthClass(idx)"
                  >
                    {{ m.short }}
                  </button>
                </div>
                <div class="flex justify-between px-3 py-2 border-t border-gray-200 rounded-b-xl bg-white">
                  <button @click="selectCurrentMonth" class="px-1.5 py-0.5 text-xs text-primary-600 hover:text-primary-700 font-medium">Este mes</button>
                  <button @click="show = false" class="px-1.5 py-0.5 text-xs text-gray-600 hover:text-gray-700 font-medium">Cerrar</button>
                </div>
              </template>

              <!-- Date mode -->
              <template v-else>
                <div class="flex items-center justify-between px-3 py-2 bg-white rounded-t-xl border-b border-gray-100">
                  <button @click="prevMonth" class="p-1 hover:bg-gray-100 rounded-md text-primary-700">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h3 class="text-xs font-semibold text-gray-900">{{ currentMonthName }} {{ displayYear }}</h3>
                  <button @click="nextMonth" class="p-1 hover:bg-gray-100 rounded-md text-primary-700">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <div class="grid grid-cols-7 gap-1 px-3 py-2">
                  <div v-for="d in weekDays" :key="d" class="text-center text-[10px] font-medium text-gray-500 py-0.5">{{ d }}</div>
                </div>
                <div class="grid grid-cols-7 gap-1 px-3 pb-2">
                  <button
                    v-for="day in calendarDays"
                    :key="day.date"
                    @click="selectDate(day.date)"
                    :class="[
                      'h-8 w-8 rounded-full text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/40',
                      day.isCurrentMonth ? 'text-gray-700 hover:bg-primary-100' : 'text-gray-400',
                      day.isToday ? 'bg-primary-600 text-white hover:bg-primary-700' : '',
                      day.isSelected ? 'bg-primary-100 text-primary-900 ring-2 ring-primary-500' : ''
                    ]"
                  >
                    {{ day.day }}
                  </button>
                </div>
                <div class="flex justify-between px-3 py-2 border-t border-gray-200 rounded-b-xl bg-white">
                  <div class="space-x-1">
                    <button @click="selectYesterday" class="px-1.5 py-0.5 text-xs text-primary-600 hover:text-primary-700 font-medium">Ayer</button>
                    <button @click="selectToday" class="px-1.5 py-0.5 text-xs text-primary-600 hover:text-primary-700 font-medium">Hoy</button>
                    <button @click="selectTomorrow" class="px-1.5 py-0.5 text-xs text-primary-600 hover:text-primary-700 font-medium">Mañana</button>
                  </div>
                  <button @click="show = false" class="px-1.5 py-0.5 text-xs text-gray-600 hover:text-gray-700 font-medium">Cerrar</button>
                </div>
              </template>
            </div>
          </div>

          <!-- Mobile bottom sheet -->
          <div
            v-else
            data-datepicker
            class="fixed inset-x-0 bottom-0 z-[80] bg-white border-t border-gray-200 rounded-t-2xl shadow-2xl"
            @click.stop
          >
            <div class="p-0">
              <!-- Month mode -->
              <template v-if="isMonthMode">
                <div class="flex items-center justify-between px-4 py-3 bg-white rounded-t-2xl border-b border-gray-100">
                  <button @click="prevYear" class="p-2 hover:bg-gray-100 rounded-md text-primary-700">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h3 class="text-sm font-semibold text-gray-900">{{ displayYear }}</h3>
                  <button @click="nextYear" class="p-2 hover:bg-gray-100 rounded-md text-primary-700">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <div class="grid grid-cols-3 gap-2 p-4">
                  <button
                    v-for="(m, idx) in months"
                    :key="m.value"
                    @click="selectMonth(idx)"
                    :class="[...monthClass(idx), 'py-3']"
                  >
                    {{ m.short }}
                  </button>
                </div>
                <div class="flex justify-between px-4 py-3 border-t border-gray-200 rounded-b-2xl bg-white">
                  <button @click="selectCurrentMonth" class="px-2 py-1 text-xs text-primary-600 hover:text-primary-700 font-medium">Este mes</button>
                  <button @click="show = false" class="px-2 py-1 text-xs text-gray-600 hover:text-gray-700 font-medium">Cerrar</button>
                </div>
              </template>

              <!-- Date mode -->
              <template v-else>
                <div class="flex items-center justify-between px-4 py-3 bg-white rounded-t-2xl border-b border-gray-100">
                  <button @click="prevMonth" class="p-2 hover:bg-gray-100 rounded-md text-primary-700">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h3 class="text-sm font-semibold text-gray-900">{{ currentMonthName }} {{ displayYear }}</h3>
                  <button @click="nextMonth" class="p-2 hover:bg-gray-100 rounded-md text-primary-700">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <div class="grid grid-cols-7 gap-2 px-4 py-3">
                  <div v-for="d in weekDays" :key="d" class="text-center text-[11px] font-medium text-gray-500">{{ d }}</div>
                </div>
                <div class="grid grid-cols-7 gap-2 px-4 pb-3">
                  <button
                    v-for="day in calendarDays"
                    :key="day.date"
                    @click="selectDate(day.date)"
                    :class="[
                      'h-10 w-10 rounded-full text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/40',
                      day.isCurrentMonth ? 'text-gray-700 hover:bg-primary-100' : 'text-gray-400',
                      day.isToday ? 'bg-primary-600 text-white hover:bg-primary-700' : '',
                      day.isSelected ? 'bg-primary-100 text-primary-900 ring-2 ring-primary-500' : ''
                    ]"
                  >
                    {{ day.day }}
                  </button>
                </div>
                <div class="flex justify-between px-4 py-3 border-t border-gray-200 rounded-b-2xl bg-white">
                  <div class="space-x-1">
                    <button @click="selectYesterday" class="px-2 py-1 text-xs text-primary-600 hover:text-primary-700 font-medium">Ayer</button>
                    <button @click="selectToday" class="px-2 py-1 text-xs text-primary-600 hover:text-primary-700 font-medium">Hoy</button>
                    <button @click="selectTomorrow" class="px-2 py-1 text-xs text-primary-600 hover:text-primary-700 font-medium">Mañana</button>
                  </div>
                  <button @click="show = false" class="px-2 py-1 text-xs text-gray-600 hover:text-gray-700 font-medium">Cerrar</button>
                </div>
              </template>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const props = defineProps({
  modelValue: { type: String, default: '' }, // 'yyyy-MM' for month, 'yyyy-MM-dd' for date
  mode: { type: String, default: 'date' }, // 'date' | 'month'
  label: { type: String, default: '' },
  ariaLabel: { type: String, default: '' },
  id: { type: String, default: null }
})
const emit = defineEmits(['update:modelValue'])

const isMonthMode = computed(() => props.mode === 'month')
const isMobile = ref(false)

const inputRef = ref(null)
const show = ref(false)
const anchorRect = ref(null)

// Month mode state
const months = [
  { value: 0, name: 'Enero', short: 'ENE' },
  { value: 1, name: 'Febrero', short: 'FEB' },
  { value: 2, name: 'Marzo', short: 'MAR' },
  { value: 3, name: 'Abril', short: 'ABR' },
  { value: 4, name: 'Mayo', short: 'MAY' },
  { value: 5, name: 'Junio', short: 'JUN' },
  { value: 6, name: 'Julio', short: 'JUL' },
  { value: 7, name: 'Agosto', short: 'AGO' },
  { value: 8, name: 'Septiembre', short: 'SEP' },
  { value: 9, name: 'Octubre', short: 'OCT' },
  { value: 10, name: 'Noviembre', short: 'NOV' },
  { value: 11, name: 'Diciembre', short: 'DIC' }
]
const selectedYear = ref(new Date().getFullYear())
const selectedMonthIndex = ref(new Date().getMonth())

// Date mode state
const currentDate = ref(new Date())
const selectedDate = ref(new Date())
const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

// Sync from model
const syncFromModel = () => {
  const v = (props.modelValue || '').trim()
  if (isMonthMode.value) {
    if (/^\d{4}-\d{2}$/.test(v)) {
      const [y, m] = v.split('-').map(Number)
      selectedYear.value = y
      selectedMonthIndex.value = m - 1
    }
  } else {
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      const [y, m, d] = v.split('-').map(Number)
      const date = new Date(y, m - 1, d)
      selectedDate.value = date
      currentDate.value = new Date(y, m - 1, 1)
    }
  }
}
watch(() => props.modelValue, syncFromModel, { immediate: true })

const displayYear = computed(() => isMonthMode.value ? selectedYear.value : currentDate.value.getFullYear())
const currentMonthIndex = computed(() => isMonthMode.value ? selectedMonthIndex.value : currentDate.value.getMonth())
const currentMonthName = computed(() => months[currentMonthIndex.value]?.name || '')

const displayValue = computed(() => {
  try {
    if (isMonthMode.value) {
      const y = selectedYear.value
      const m = String(selectedMonthIndex.value + 1).padStart(2, '0')
      return format(new Date(y, selectedMonthIndex.value, 1), 'MMMM yyyy', { locale: es })
    } else {
      return format(selectedDate.value, 'dd/MM/yyyy')
    }
  } catch {
    return props.modelValue
  }
})

const togglePanel = async () => {
  show.value = !show.value
  if (show.value) {
    await nextTick()
    anchorRect.value = inputRef.value?.getBoundingClientRect?.()
  }
}

const panelStyle = computed(() => {
  const rect = anchorRect.value
  if (!rect) return {}
  const datepickerHeight = 300
  let top = rect.top - datepickerHeight - 4
  let left = rect.left
  if (top < 16) top = rect.bottom + 4
  const width = 300
  if (left + width > window.innerWidth) left = window.innerWidth - width - 16
  if (left < 16) left = 16
  return { top: `${top}px`, left: `${left}px`, width: `${width}px` }
})

// Month mode actions
const monthClass = (idx) => {
  const isSelected = idx === selectedMonthIndex.value
  return [
    'text-xs font-semibold rounded-lg py-2 active:scale-[0.98]',
    'hover:bg-primary-100 hover:text-primary-900',
    'transition-all',
    isSelected ? 'bg-primary-600 text-white shadow' : 'text-gray-700'
  ]
}
const selectMonth = (idx) => {
  selectedMonthIndex.value = idx
  emit('update:modelValue', `${selectedYear.value}-${String(idx + 1).padStart(2, '0')}`)
  show.value = false
}
const selectCurrentMonth = () => {
  const now = new Date()
  selectedYear.value = now.getFullYear()
  selectedMonthIndex.value = now.getMonth()
  emit('update:modelValue', `${selectedYear.value}-${String(selectedMonthIndex.value + 1).padStart(2, '0')}`)
  show.value = false
}
const prevYear = () => { selectedYear.value -= 1 }
const nextYear = () => { selectedYear.value += 1 }

// Date mode actions
const previousMonth = () => {
  const d = new Date(currentDate.value)
  d.setMonth(d.getMonth() - 1)
  currentDate.value = d
}
const nextMonth = () => {
  const d = new Date(currentDate.value)
  d.setMonth(d.getMonth() + 1)
  currentDate.value = d
}
// name alias for template
const prevMonth = previousMonth

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  const days = []
  const today = new Date()
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    const isCurrentMonth = date.getMonth() === month
    const isToday = date.toDateString() === today.toDateString()
    const isSelected = date.toDateString() === selectedDate.value.toDateString()
    days.push({
      date: format(date, 'yyyy-MM-dd'),
      day: date.getDate(),
      isCurrentMonth, isToday, isSelected
    })
  }
  return days
})

const selectDate = (dateString) => {
  // Parsear la fecha en zona horaria local para evitar problemas de UTC
  const [y, m, d] = dateString.split('-').map(Number)
  const localDate = new Date(y, m - 1, d)
  selectedDate.value = localDate
  // Emitir el string original sin reparsear
  emit('update:modelValue', dateString)
  show.value = false
}
const selectToday = () => {
  const d = new Date()
  selectedDate.value = d
  currentDate.value = new Date(d.getFullYear(), d.getMonth(), 1)
  emit('update:modelValue', format(d, 'yyyy-MM-dd'))
  show.value = false
}
const selectYesterday = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  selectedDate.value = d
  currentDate.value = new Date(d.getFullYear(), d.getMonth(), 1)
  emit('update:modelValue', format(d, 'yyyy-MM-dd'))
  show.value = false
}
const selectTomorrow = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  selectedDate.value = d
  currentDate.value = new Date(d.getFullYear(), d.getMonth(), 1)
  emit('update:modelValue', format(d, 'yyyy-MM-dd'))
  show.value = false
}

const handleClickOutside = (event) => {
  if (!show.value) return
  const target = event.target
  if (target.closest('.datepicker-container') || target.closest('[data-datepicker]')) return
  show.value = false
}
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
  const updateIsMobile = () => { isMobile.value = window.innerWidth <= 480 }
  updateIsMobile()
  window.addEventListener('resize', updateIsMobile)
  window.__appDatePickerResize = updateIsMobile
  
  // Assign ID to the input element
  if (props.id && inputRef.value) {
    inputRef.value.id = props.id
  }
})

// Watch for changes in the input ref and assign ID
watch(inputRef, (newRef) => {
  if (newRef && props.id) {
    newRef.id = props.id
  }
}, { immediate: true })
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
  const cleanup = window.__appDatePickerResize
  if (cleanup) window.removeEventListener('resize', cleanup)
})

const handleKeydown = (e) => {
  if (e.key === 'Escape' && show.value) {
    show.value = false
  }
}

// Prevenir scroll del body cuando el calendario mobile está abierto
watch(show, (newValue) => {
  if (isMobile.value) {
    if (newValue) {
      // Prevenir scroll cuando se abre
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      // Restaurar scroll cuando se cierra
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
  }
})

// Limpiar estilos al desmontar
onUnmounted(() => {
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.width = ''
})
</script>

<style scoped>
</style>


