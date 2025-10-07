<template>
  <div class="relative overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-500">
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
        'relative bg-white border border-gray-200 rounded-lg p-4 shadow-sm transition-all duration-500 ease-out hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 cursor-pointer touch-pan-y group',
        {
          'transition-transform duration-200 ease-out': isDragging,
          'shadow-md scale-[1.005] -translate-y-0.5': shouldShowMobileAnimations
        }
      ]"
      :style="{ transform: `translateX(${swipeOffset}px)` }"
      role="article"
      :aria-label="`Crédito: ${credit.name} - Saldo: $${(credit?.balance || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`"
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
      <!-- Header de la card -->
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center space-x-3 flex-1">
          <div class="flex-shrink-0">
                <CreditCardIcon 
                  :type="getCardType(credit.brand)" 
                  size="medium" 
                />
          </div>
          <div class="flex-1">
            <h3 class="font-medium text-gray-900 text-sm transition-all duration-300 ease-out hover:text-gray-700 group-hover:scale-105" :class="{ 'text-gray-700': shouldShowMobileAnimations }">
              {{ credit.name }}
            </h3>
            <div class="flex items-center space-x-2 mt-1">
              <span v-if="credit.brand" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium transition-all duration-300 ease-out hover:scale-105" 
                    :style="{ backgroundColor: getCardTypeColor(credit.brand) + '20', color: getCardTypeColor(credit.brand) }"
                    :class="{ 'scale-102': shouldShowMobileAnimations }">
                {{ credit.brand }}
              </span>
              <span v-if="credit.maskPan" class="text-xs text-gray-400">•••• {{ credit.maskPan }}</span>
            </div>
          </div>
        </div>
          <span :class="[
            credit.active ? 'badge badge-success' : 'badge badge-gray',
            'transition-all duration-300 ease-out hover:scale-105',
            { 'scale-102': shouldShowMobileAnimations }
          ]">
            {{ credit.active ? 'Activa' : 'Inactiva' }}
          </span>
      </div>

      <!-- Información principal -->
      <div class="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div class="text-xs text-gray-500">Emisor</div>
          <div class="text-sm font-medium text-gray-900 transition-all duration-300 ease-out hover:text-gray-700" :class="{ 'text-gray-700': shouldShowMobileAnimations }">
            {{ credit.issuer || '-' }}
          </div>
        </div>
        <div>
          <div class="text-xs text-gray-500">Límite</div>
          <div class="text-sm font-medium text-gray-900 transition-all duration-300 ease-out hover:text-gray-700" :class="{ 'text-gray-700': shouldShowMobileAnimations }">
            {{ formatCurrency(credit.creditLimit) }}
          </div>
        </div>
      </div>

      <!-- Saldo con barra de progreso -->
      <div class="mb-3">
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs text-gray-500">Saldo actual</span>
          <span class="text-sm font-semibold text-gray-900 transition-all duration-300 ease-out hover:text-gray-700 hover:scale-105" :class="{ 'text-gray-700 scale-102': shouldShowMobileAnimations }">
            {{ formatCurrency(credit.balance) }}
          </span>
        </div>
        <div class="h-2 w-full bg-gray-100 rounded-full overflow-hidden group-hover:bg-gray-200 transition-colors duration-300">
          <div
            class="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-700 ease-out group-hover:from-primary-600 group-hover:to-primary-700"
            :style="{ width: getUtilizationWidth(credit.balance, credit.creditLimit) }"
          ></div>
        </div>
      </div>

      <!-- Fechas -->
      <div class="grid grid-cols-2 gap-3 mb-4">
        <div>
          <div class="text-xs text-gray-500">Día de pago</div>
          <div class="text-sm font-medium text-gray-900 transition-all duration-300 ease-out hover:text-gray-700" :class="{ 'text-gray-700': shouldShowMobileAnimations }">
            {{ credit.dueDay || '-' }}
          </div>
        </div>
        <div>
          <div class="text-xs text-gray-500">Día de corte</div>
          <div class="text-sm font-medium text-gray-900 transition-all duration-300 ease-out hover:text-gray-700" :class="{ 'text-gray-700': shouldShowMobileAnimations }">
            {{ credit.cutOffDay || '-' }}
          </div>
        </div>
      </div>

      <!-- Acciones -->
      <div class="flex justify-between items-center pt-3 border-t border-gray-100">
        <div class="flex space-x-2">
          <button 
            class="p-2 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-300 transition-all duration-300 ease-out hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 opacity-70 hover:opacity-100 group/btn" 
            @click.stop="$emit('edit', credit)" 
            aria-label="Editar crédito"
            :class="{ 'scale-105 bg-primary-50 shadow-sm opacity-100': shouldShowMobileAnimations }"
          >
            <svg class="h-4 w-4 transition-all duration-300 ease-out" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5h2m-6 14h10a2 2 0 002-2v-5.586a1 1 0 00-.293-.707l-6.414-6.414A1 1 0 0011.586 4H6a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            <span class="sr-only">Editar crédito</span>
          </button>
          <button 
            class="p-2 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all duration-300 ease-out hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 opacity-70 hover:opacity-100 group/btn" 
            @click.stop="$emit('summary', credit)" 
            aria-label="Ver resumen"
            :class="{ 'scale-105 bg-blue-50 shadow-sm opacity-100': shouldShowMobileAnimations }"
          >
                      <svg class="h-4 w-4 transition-all duration-300 ease-out" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="sr-only">Ver resumen</span>
          </button>
          <button 
            class="p-2 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-all duration-300 ease-out hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 opacity-70 hover:opacity-100 group/btn" 
            @click.stop="$emit('installments', credit)" 
            aria-label="Ver cuotas"
            :class="{ 'scale-105 bg-green-50 shadow-sm opacity-100': shouldShowMobileAnimations }"
          >
                      <svg class="h-4 w-4 transition-all duration-300 ease-out" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span class="sr-only">Ver cuotas</span>
          </button>
        </div>
        <button 
          class="p-2 rounded-md border border-gray-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-300 ease-out hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 group/btn" 
          @click.stop="$emit('delete', credit)" 
          aria-label="Eliminar crédito"
          :class="{ 'scale-105 bg-red-50 shadow-sm': shouldShowMobileAnimations }"
        >
          <svg class="h-4 w-4 transition-all duration-300 ease-out" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0V5a2 2 0 012-2h2a2 2 0 012 2v2"/>
          </svg>
          <span class="sr-only">Eliminar crédito</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import CreditCardIcon from './ui/CreditCardIcon.vue'

const props = defineProps({
  credit: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete', 'summary', 'installments'])

// Swipe logic
const cardRef = ref(null)
const swipeOffset = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const currentX = ref(0)
const isMouseDown = ref(false)

// Mobile animation state
const isTouching = ref(false)
const isMobile = ref(false)

const shouldShowMobileAnimations = computed(() => isMobile.value && isTouching.value)

onMounted(() => {
  isMobile.value = window.innerWidth < 640
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 640
  })
})

const checkIfMobile = () => {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth < 640
  }
}

// Touch events
const onTouchStart = (e) => {
  checkIfMobile()
  if (!isMobile.value) return
  
  isTouching.value = true
  isDragging.value = true
  startX.value = e.touches[0].clientX
  currentX.value = e.touches[0].clientX
}

const onTouchMove = (e) => {
  if (!isMobile.value || !isDragging.value) return
  
  currentX.value = e.touches[0].clientX
  const deltaX = currentX.value - startX.value
  
  // Limit swipe distance
  const maxSwipe = 120
  swipeOffset.value = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX))
}

const onTouchEnd = () => {
  if (!isMobile.value || !isDragging.value) return
  
  isDragging.value = false
  
  // Determine if swipe was significant enough
  const swipeThreshold = 60
  const deltaX = currentX.value - startX.value
  
  if (Math.abs(deltaX) > swipeThreshold) {
    if (deltaX > 0) {
      // Swipe right - Edit
      emit('edit', props.credit)
    } else {
      // Swipe left - Delete
      emit('delete', props.credit)
    }
  }
  
  // Reset position
  swipeOffset.value = 0
  startX.value = 0
  currentX.value = 0
  
  setTimeout(() => {
    isTouching.value = false
  }, 150)
}

// Mouse events for desktop testing
const onMouseEnter = () => {
  if (isMobile.value) {
    isTouching.value = true
  }
}

const onMouseLeave = () => {
  if (isMobile.value) {
    setTimeout(() => {
      isTouching.value = false
    }, 100)
  }
}

const onMouseDown = (e) => {
  if (isMobile.value) return // Only on desktop for testing
  
  isMouseDown.value = true
  isDragging.value = true
  startX.value = e.clientX
  currentX.value = e.clientX
}

const onMouseMove = (e) => {
  if (!isMouseDown.value || !isDragging.value) return
  
  currentX.value = e.clientX
  const deltaX = currentX.value - startX.value
  
  const maxSwipe = 120
  swipeOffset.value = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX))
}

const onMouseEnd = () => {
  if (!isMouseDown.value || !isDragging.value) return
  
  isMouseDown.value = false
  isDragging.value = false
  
  const swipeThreshold = 60
  const deltaX = currentX.value - startX.value
  
  if (Math.abs(deltaX) > swipeThreshold) {
    if (deltaX > 0) {
      emit('edit', props.credit)
    } else {
      emit('delete', props.credit)
    }
  }
  
  swipeOffset.value = 0
  startX.value = 0
  currentX.value = 0
}

// Utility functions
const formatCurrency = (amount) => {
  const num = Number(amount) || 0
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

const getUtilizationWidth = (balance, creditLimit) => {
  if (!creditLimit || creditLimit <= 0) return '0%'
  const percentage = Math.min(100, Math.max(0, ((balance || 0) / creditLimit) * 100))
  return `${percentage.toFixed(1)}%`
}

const getCardType = (brand) => {
  if (!brand) return 'generic'
  
  const brandLower = brand.toLowerCase()
  if (brandLower.includes('visa')) return 'visa'
  if (brandLower.includes('mastercard') || brandLower.includes('master')) return 'mastercard'
  if (brandLower.includes('amex') || brandLower.includes('american express')) return 'amex'
  if (brandLower.includes('discover')) return 'discover'
  
  return 'generic'
}

const getCardTypeColor = (brand) => {
  const colors = {
    'Visa': '#1A1F71',
    'Mastercard': '#EB001B',
    'American Express': '#006FCF',
    'Discover': '#FF6000',
    'Diners Club': '#0079BE',
    'JCB': '#003B7C'
  }
  return colors[brand] || '#6B7280'
}
</script>
