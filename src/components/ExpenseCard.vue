<template>
  <div class="relative overflow-hidden">
    <!-- Swipe Actions Background -->
    <div class="absolute inset-0 flex">
      <!-- Left Action (Edit) -->
      <div 
        class="flex items-center justify-center bg-blue-500 text-white px-6 transition-all duration-200"
        :class="{ 'opacity-100': swipeOffset > 0, 'opacity-0': swipeOffset <= 0 }"
        :style="{ width: `${Math.min(Math.abs(swipeOffset), 80)}px` }"
      >
        <div class="flex flex-col items-center">
          <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5h2m-6 14h10a2 2 0 002-2v-5.586a1 1 0 00-.293-.707l-6.414-6.414A1 1 0 0011.586 4H6a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          <span class="text-xs font-medium">Editar</span>
        </div>
      </div>
      
      <!-- Right Action (Delete) -->
      <div 
        class="flex items-center justify-center bg-red-500 text-white px-6 ml-auto transition-all duration-200"
        :class="{ 'opacity-100': swipeOffset < 0, 'opacity-0': swipeOffset >= 0 }"
        :style="{ width: `${Math.min(Math.abs(swipeOffset), 80)}px` }"
      >
        <div class="flex flex-col items-center">
          <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0V5a2 2 0 012-2h2a2 2 0 012 2v2"/>
          </svg>
          <span class="text-xs font-medium">Eliminar</span>
        </div>
      </div>
    </div>

    <!-- Main Card Content -->
    <div
      ref="cardRef"
      :class="[
        'relative flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl border transition-all duration-300 ease-out hover:shadow-lg hover:scale-[1.01] hover:-translate-y-1 cursor-pointer touch-pan-y',
        expense.isFixed ? 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300',
        { 
          'transition-transform duration-200 ease-out': isDragging,
          'shadow-md scale-[1.005] -translate-y-0.5': shouldShowMobileAnimations.value
        }
      ]"
      :style="{ transform: `translateX(${swipeOffset}px)` }"
      role="article"
      :aria-label="`Gasto: ${expense.description} por $${(expense?.amount || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`"
      tabindex="0"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseEnd"
    >
    <div class="flex-1 min-w-0">
      <div class="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
        <div class="flex-shrink-0">
          <span 
            :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 transition-all duration-300 ease-out hover:bg-primary-200 hover:scale-105',
              { 'bg-primary-200 scale-102': shouldShowMobileAnimations.value }
            ]"
          >
            {{ expense.category.name }}
          </span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
            <h3 
              :class="[
                'text-sm font-medium text-gray-900 truncate transition-all duration-300 ease-out hover:text-gray-700',
                { 'text-gray-700': shouldShowMobileAnimations.value }
              ]"
            >
              {{ expense.description }}
            </h3>
            <span 
              v-if="expense.isFixed" 
              :class="[
                'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wide transition-all duration-300 ease-out hover:bg-blue-700 hover:scale-105',
                { 'bg-blue-700 scale-102': shouldShowMobileAnimations.value }
              ]"
            >
              Fijo
            </span>
            <span 
              v-if="isCreditPayment(expense)" 
              :class="[
                'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-600 text-white uppercase tracking-wide transition-all duration-300 ease-out hover:bg-red-700 hover:scale-105',
                { 'bg-red-700 scale-102': shouldShowMobileAnimations.value }
              ]"
            >
              <svg 
                :class="[
                  'w-3 h-3 mr-1 transition-all duration-300 ease-out',
                  { 'rotate-6': shouldShowMobileAnimations.value }
                ]"
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
              Crédito
            </span>
            <span
              v-if="expense.entryType === 'payment'"
              :class="[
                'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide transition-all duration-300 ease-out hover:bg-emerald-200 hover:scale-105',
                { 'bg-emerald-200 scale-102': shouldShowMobileAnimations.value }
              ]"
            >
              Abono
            </span>
            <span
              v-else-if="expense.entryType === 'charge'"
              :class="[
                'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wide transition-all duration-300 ease-out hover:bg-amber-200 hover:scale-105',
                { 'bg-amber-200 scale-102': shouldShowMobileAnimations.value }
              ]"
            >
              Cargo
            </span>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-1">
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
    <div class="text-right mt-3 sm:mt-0">
      <p 
        :class="[
          'text-sm font-semibold text-gray-900 transition-all duration-300 ease-out hover:text-gray-700 hover:scale-105',
          { 'text-gray-700 scale-102': shouldShowMobileAnimations.value }
        ]"
      >
        ${{ (expense?.amount || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
      </p>
      <div class="mt-2 flex justify-end gap-2">
        <button
          :class="[
            'p-1.5 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-primary-700 transition-all duration-300 ease-out hover:scale-110 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 opacity-70 hover:opacity-100',
            { 'scale-105 bg-gray-50 shadow-sm opacity-100': shouldShowMobileAnimations.value }
          ]"
          :aria-label="`Editar gasto: ${expense.description}`"
          title="Editar gasto"
          @click.stop="$emit('edit', expense)"
        >
          <svg 
            :class="[
              'h-4 w-4 transition-all duration-300 ease-out',
              { 'rotate-6': shouldShowMobileAnimations.value }
            ]"
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5h2m-6 14h10a2 2 0 002-2v-5.586a1 1 0 00-.293-.707l-6.414-6.414A1 1 0 0011.586 4H6a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          <span class="sr-only">Editar gasto</span>
        </button>
        <button
          :class="[
            'p-1.5 rounded-md border border-gray-200 bg-white text-red-600 hover:bg-red-50 transition-all duration-300 ease-out hover:scale-110 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 opacity-70 hover:opacity-100',
            { 'scale-105 bg-red-50 shadow-sm opacity-100': shouldShowMobileAnimations.value }
          ]"
          :aria-label="`Eliminar gasto: ${expense.description}`"
          title="Eliminar gasto"
          @click.stop="$emit('delete', expense)"
        >
          <svg 
            :class="[
              'h-4 w-4 transition-all duration-300 ease-out',
              { 'rotate-6': shouldShowMobileAnimations.value }
            ]"
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0V5a2 2 0 012-2h2a2 2 0 012 2v2"/>
          </svg>
          <span class="sr-only">Eliminar gasto</span>
        </button>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useExpenseStore } from '../stores/expenseStore'

// Props
const props = defineProps({
  expense: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['edit', 'delete'])

// Swipe functionality
const cardRef = ref(null)
const swipeOffset = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const currentX = ref(0)
const isMouseDown = ref(false)
const isTouching = ref(false)
const isMobile = ref(false)

// Computed for mobile animations
const shouldShowMobileAnimations = computed(() => isMobile.value && isTouching.value)

// Initialize mobile detection
onMounted(() => {
  isMobile.value = window.innerWidth < 640
})

// Also check on touch start in case component isn't mounted yet
const checkIfMobile = () => {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth < 640
  }
}

// Touch events
const onTouchStart = (e) => {
  checkIfMobile() // Check screen size on each touch
  if (!isMobile.value) return // Only on mobile
  startX.value = e.touches[0].clientX
  currentX.value = e.touches[0].clientX
  isDragging.value = true
  isTouching.value = true
}

const onTouchMove = (e) => {
  if (!isDragging.value || !isMobile.value) return
  e.preventDefault()
  currentX.value = e.touches[0].clientX
  const deltaX = currentX.value - startX.value
  swipeOffset.value = Math.max(-100, Math.min(100, deltaX))
}

const onTouchEnd = () => {
  if (!isDragging.value || !isMobile.value) return
  isDragging.value = false
  
  const threshold = 50
  if (swipeOffset.value > threshold) {
    // Swipe right - Edit
    emit('edit', props.expense)
  } else if (swipeOffset.value < -threshold) {
    // Swipe left - Delete
    emit('delete', props.expense)
  }
  
  // Reset position
  swipeOffset.value = 0
  
  // Delay to show animation before removing touch state
  setTimeout(() => {
    isTouching.value = false
  }, 150)
}

// Mouse events for hover animations and swipe testing
const onMouseEnter = () => {
  if (isMobile.value) {
    // On mobile, show hover-like animations when mouse enters
    isTouching.value = true
  }
}

const onMouseLeave = () => {
  if (isMobile.value) {
    // On mobile, hide hover-like animations when mouse leaves
    setTimeout(() => {
      isTouching.value = false
    }, 100)
  }
}

const onMouseDown = (e) => {
  if (isMobile.value) return // Only on desktop for testing
  isMouseDown.value = true
  startX.value = e.clientX
  currentX.value = e.clientX
  isDragging.value = true
  e.preventDefault()
}

const onMouseMove = (e) => {
  if (!isMouseDown.value || !isDragging.value || isMobile.value) return
  currentX.value = e.clientX
  const deltaX = currentX.value - startX.value
  swipeOffset.value = Math.max(-100, Math.min(100, deltaX))
}

const onMouseEnd = () => {
  if (!isMouseDown.value || isMobile.value) return
  isMouseDown.value = false
  isDragging.value = false
  
  const threshold = 50
  if (swipeOffset.value > threshold) {
    // Swipe right - Edit
    emit('edit', props.expense)
  } else if (swipeOffset.value < -threshold) {
    // Swipe left - Delete
    emit('delete', props.expense)
  }
  
  // Reset position
  swipeOffset.value = 0
}

// Cleanup
onUnmounted(() => {
  isDragging.value = false
  isMouseDown.value = false
})

// Store
const expenseStore = useExpenseStore()

// Methods
const parseLocalDate = (dateString) => {
  if (!dateString) return new Date()
  return new Date(dateString + 'T00:00:00')
}

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
  if (description.includes('crédito') || description.includes('credito')) return true
  return false
}
</script>
