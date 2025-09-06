<template>
  <div class="card">
    <h2 class="text-lg font-semibold text-gray-900 mb-4">Configurar Presupuesto Mensual</h2>
    
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="datepicker-container">
        <label for="month" class="block text-sm font-medium text-gray-700 mb-1">
          Mes
        </label>
        <div class="relative">
          <input
            id="month"
            ref="monthInputRef"
            :value="displayMonthLabel"
            type="text"
            required
            class="input-field cursor-pointer"
            @click="toggleMonthPicker"
            readonly
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
            <div
              v-if="showMonthPicker"
              data-monthpicker
              class="fixed z-[60] bg-white border border-gray-200 rounded-lg shadow-xl p-3 w-[280px]"
              :style="monthPickerStyle"
              @click.stop
            >
              <div class="flex items-center justify-between mb-2">
                <button class="p-1 hover:bg-gray-100 rounded transition-colors" @click="prevYear">
                  <svg class="h-3 w-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 class="text-xs font-semibold text-gray-900">{{ currentYear }}</h3>
                <button class="p-1 hover:bg-gray-100 rounded transition-colors" @click="nextYear">
                  <svg class="h-3 w-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="(m, idx) in months"
                  :key="m"
                  @click="selectMonth(idx)"
                  :class="[
                    'px-2 py-1 rounded text-xs font-medium transition-colors',
                    isSelectedMonth(idx) ? 'bg-primary-600 text-white hover:bg-primary-700' : 'text-gray-700 hover:bg-primary-50'
                  ]"
                >
                  {{ m }}
                </button>
              </div>
              <div class="flex justify-end mt-2 pt-2 border-t border-gray-200">
                <button @click="showMonthPicker = false" class="px-2 py-1 text-xs text-gray-600 hover:text-gray-800">Cerrar</button>
              </div>
            </div>
          </Transition>
        </Teleport>
      </div>

      <div>
        <label for="amount" class="block text-sm font-medium text-gray-700 mb-1">
          Presupuesto
        </label>
        <input
          id="amount"
          v-model="form.amount"
          type="number"
          step="0.01"
          min="0"
          required
          class="input-field"
          placeholder="0.00"
        />
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="btn-primary w-full"
        :class="{ 'opacity-50 cursor-not-allowed': loading }"
      >
        {{ loading ? 'Guardando...' : 'Guardar Presupuesto' }}
      </button>
    </form>

    <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-sm text-red-600">{{ error }}</p>
    </div>

    <div v-if="success" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
      <p class="text-sm text-green-600">Presupuesto actualizado correctamente</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { format } from 'date-fns'
import { useExpenseStore } from '../stores/expenseStore'
import { push } from 'notivue'

const expenseStore = useExpenseStore()

const form = reactive({
  month: '',
  amount: ''
})

const error = ref('')
const success = ref(false)
const showMonthPicker = ref(false)
const monthInputRef = ref(null)
const monthCursor = ref(new Date())

onMounted(() => {
  form.month = format(new Date(), 'yyyy-MM')
  if (expenseStore.budget.amount > 0) {
    form.amount = expenseStore.budget.amount.toString()
  }
})

const loading = computed(() => expenseStore.loading)

const displayMonthLabel = computed(() => {
  if (!form.month) return ''
  const [y, m] = form.month.split('-').map(Number)
  const d = new Date(y, m - 1, 1)
  return format(d, 'MMMM yyyy')
})

const currentYear = computed(() => monthCursor.value.getFullYear())
const currentMonthIndex = computed(() => monthCursor.value.getMonth())
const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

const monthPickerStyle = computed(() => {
  if (!monthInputRef.value || !showMonthPicker.value) return {}
  const rect = monthInputRef.value.getBoundingClientRect()
  const width = 280
  const height = 220
  // Por defecto, abrir hacia abajo
  let top = rect.bottom + 6
  let left = rect.left
  // Si se sale por abajo, intentar abrir arriba
  if (top + height > window.innerHeight - 16) {
    top = rect.top - height - 6
  }
  if (left + width > window.innerWidth) left = window.innerWidth - width - 16
  if (left < 16) left = 16
  return { top: `${top}px`, left: `${left}px`, width: `${width}px` }
})

const toggleMonthPicker = () => {
  showMonthPicker.value = !showMonthPicker.value
}

const prevYear = () => {
  const d = new Date(monthCursor.value)
  d.setFullYear(d.getFullYear() - 1)
  monthCursor.value = d
}
const nextYear = () => {
  const d = new Date(monthCursor.value)
  d.setFullYear(d.getFullYear() + 1)
  monthCursor.value = d
}

const isSelectedMonth = (idx) => {
  if (!form.month) return false
  const [y, m] = form.month.split('-').map(Number)
  return y === currentYear.value && (m - 1) === idx
}

const selectMonth = (idx) => {
  const y = currentYear.value
  const m = String(idx + 1).padStart(2, '0')
  form.month = `${y}-${m}`
  showMonthPicker.value = false
}

const handleSubmit = async () => {
  try {
    error.value = ''
    success.value = false
    
    await expenseStore.updateBudget(form)
    success.value = true
    push.success('Presupuesto actualizado correctamente')
    
    // Ocultar mensaje de éxito después de 3 segundos
    setTimeout(() => {
      success.value = false
    }, 3000)
  } catch (err) {
    error.value = 'Error al actualizar el presupuesto. Inténtalo de nuevo.'
    push.error('No se pudo actualizar el presupuesto')
  }
}
</script>

<style scoped>
.input-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500;
}

.btn-primary {
  @apply inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
