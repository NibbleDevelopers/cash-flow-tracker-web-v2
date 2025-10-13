<template>
  <Teleport to="body">
    <!-- Overlay solo en mobile -->
    <Transition
      enter-active-class="ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm sm:hidden"
        @click="$emit('update:modelValue', false)"
      ></div>
    </Transition>
    
    <Transition
      enter-active-class="ease-out duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="modelValue"
        class="fixed z-[70] bg-white rounded-xl shadow-2xl border border-gray-100 w-[320px] sm:w-[300px] sm:shadow-lg sm:border-gray-200"
        :style="props.pickerStyle"
        ref="popoverRef"
        @click.stop
      >
        <!-- Header elegante -->
        <div class="bg-white border-b border-gray-100 px-3 py-2 sm:px-4 sm:py-3 rounded-t-xl">
          <div class="flex items-center justify-between">
            <h3 class="text-xs sm:text-sm font-semibold text-gray-900">Seleccionar rango de fechas</h3>
            <!-- Botón de cerrar solo en mobile -->
            <button
              @click="$emit('update:modelValue', false)"
              class="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200 sm:hidden"
            >
              <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Contenido del calendario -->
        <div class="p-3 sm:p-3">
          <!-- Presets mejorados -->
          <div class="mb-2 sm:mb-3">
            <div class="text-xs font-medium text-gray-500 mb-1.5 sm:mb-2">Rangos rápidos</div>
            <div class="flex flex-wrap gap-1.5 sm:gap-1.5">
              <button 
                v-for="preset in presets"
                :key="preset.value"
                class="px-2 py-1 sm:px-2 sm:py-1 text-xs rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors duration-200" 
                @click="$emit('apply-preset', preset.value)"
              >
                {{ preset.label }}
              </button>
            </div>
          </div>

          <!-- Header del calendario -->
          <div class="flex items-center justify-between mb-1.5 sm:mb-2">
            <button 
              class="p-1.5 sm:p-1.5 rounded-md text-primary-700 hover:bg-primary-100 transition-colors duration-200" 
              @click="$emit('prev-month')"
            >
              <svg class="h-3 w-3 sm:h-3 sm:w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div class="text-xs sm:text-xs font-semibold text-gray-900">{{ monthName }} {{ year }}</div>
            <button 
              class="p-1.5 sm:p-1.5 rounded-md text-primary-700 hover:bg-primary-100 transition-colors duration-200" 
              @click="$emit('next-month')"
            >
              <svg class="h-3 w-3 sm:h-3 sm:w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <!-- Días de la semana -->
          <div class="grid grid-cols-7 gap-1 mb-1 sm:mb-1">
            <div v-for="d in ['D','L','M','M','J','V','S']" :key="d" class="text-center py-1 sm:py-1 text-xs font-medium text-gray-500">
              {{ d }}
            </div>
          </div>

          <!-- Días del calendario -->
          <div class="grid grid-cols-7 gap-1">
            <button
              v-for="day in calendarDays"
              :key="day.date.getTime()"
              @click="$emit('pick-date', day.date)"
              :class="[
                'h-7 w-7 sm:h-7 sm:w-7 rounded-full text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/40',
                !day.isCurrentMonth ? 'text-gray-300' : 'text-gray-700 hover:bg-primary-100',
                day.isInRange ? 'bg-primary-100 text-primary-900' : '',
                day.isStart || day.isEnd ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm' : ''
              ]"
            >
              {{ day.day }}
            </button>
          </div>
        </div>

        <!-- Footer con botones mejorados -->
        <div class="px-3 py-2 sm:px-3 sm:py-2 border-t border-gray-100 rounded-b-xl bg-gray-50">
          <div class="flex justify-between items-center">
            <button 
              class="px-3 py-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-xs text-gray-600 hover:text-gray-800 transition-colors duration-200" 
              @click="$emit('clear')"
            >
              Limpiar
            </button>
            <button 
              class="px-4 py-1.5 sm:px-4 sm:py-1.5 text-xs sm:text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors duration-200" 
              @click="$emit('apply')"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  pickerStyle: {
    type: Object,
    default: () => ({})
  },
  year: {
    type: Number,
    required: true
  },
  monthName: {
    type: String,
    required: true
  },
  calendarDays: {
    type: Array,
    required: true
  }
})

const emit = defineEmits([
  'update:modelValue',
  'apply-preset',
  'prev-month',
  'next-month',
  'pick-date',
  'clear',
  'apply'
])

const popoverRef = ref(null)

const presets = [
  { label: 'Hoy', value: 'today' },
  { label: '7 días', value: '7' },
  { label: '30 días', value: '30' },
  { label: 'Este mes', value: 'thisMonth' },
  { label: 'Mes anterior', value: 'lastMonth' }
]
</script>

