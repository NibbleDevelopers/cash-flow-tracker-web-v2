<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition
      enter-active-class="ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black bg-opacity-50 z-40"
        @click="closeModal"
      ></div>
    </Transition>

    <!-- Modal -->
    <Transition
      enter-active-class="ease-out duration-300"
      enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      enter-to-class="opacity-100 translate-y-0 sm:scale-100"
      leave-active-class="ease-in duration-200"
      leave-from-class="opacity-100 translate-y-0 sm:scale-100"
      leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="closeModal"
      >
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <!-- Header -->
            <div class="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-white">
                  {{ isEditMode ? 'Editar Gasto' : 'Agregar Nuevo Gasto' }}
                </h3>
                <button
                  @click="closeModal"
                  class="rounded-md text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
                >
                  <span class="sr-only">Cerrar</span>
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Form -->
            <div class="px-6 py-6">
              <form @submit.prevent="handleSubmit" class="space-y-4">
                <div>
                  <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <input
                    id="description"
                    v-model="form.description"
                    type="text"
                    required
                    class="input-field"
                    placeholder="Ej: Netflix, Luz, Teléfono..."
                    ref="descriptionInput"
                  />
                </div>

                <div>
                  <label for="amount" class="block text-sm font-medium text-gray-700 mb-1">
                    Monto
                  </label>
                  <div class="relative">
                    <input
                      id="amount"
                      v-model="form.amount"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      class="input-field pr-20"
                      placeholder="0.00"
                    />
                    <div class="absolute inset-y-0 right-0 flex items-center">
                      <div class="flex items-center bg-primary-600 text-white px-3 py-2 rounded-r-md">
                        <span class="text-sm font-medium">$</span>
                        <span class="text-xs ml-1">USD</span>
                        <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <AppSelect
                    v-model="form.categoryId"
                    :options="categoryOptions"
                    placeholder="Selecciona una categoría"
                  />
                </div>

                <div class="datepicker-container">
                  <label for="date" class="block text-sm font-medium text-gray-700 mb-1">
                    Fecha
                  </label>
                  <AppDatePicker v-model="form.date" mode="date" aria-label="Seleccionar fecha" />
                </div>

                <!-- Toggle gasto fijo (checkbox estilizado) -->
                <div class="p-3 bg-gray-50 rounded-lg">
                  <label class="inline-flex items-center gap-2 select-none">
                    <input v-model="form.isFixed" type="checkbox" class="peer sr-only" />
                    <span class="w-10 h-6 rounded-full bg-gray-200 peer-checked:bg-primary-600 relative transition-colors">
                      <span class="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4"></span>
                    </span>
                    <span class="text-sm font-medium text-gray-700">Es un gasto fijo</span>
                    <span class="text-xs text-gray-500">Se repite cada mes</span>
                  </label>
                </div>

                <!-- Campo para día del mes (solo visible si es fijo) -->
                <Transition
                  enter-active-class="ease-out duration-200"
                  enter-from-class="opacity-0 -translate-y-2"
                  enter-to-class="opacity-100 translate-y-0"
                  leave-active-class="ease-in duration-150"
                  leave-from-class="opacity-100 translate-y-0"
                  leave-to-class="opacity-0 -translate-y-2"
                >
                  <div v-if="form.isFixed" class="space-y-2">
                    <label for="dayOfMonth" class="block text-sm font-medium text-gray-700">
                      Día del mes
                    </label>
                    <input
                      id="dayOfMonth"
                      v-model="form.dayOfMonth"
                      type="number"
                      min="1"
                      max="31"
                      required
                      class="input-field h-10"
                      placeholder="15"
                    />
                    <p class="text-xs text-gray-500">
                      El gasto se generará automáticamente este día de cada mes
                    </p>
                  </div>
                </Transition>

                <div class="p-3 bg-gray-50 rounded-lg">
                  <label class="inline-flex items-center gap-2 select-none">
                    <input v-model="form.isCredit" type="checkbox" class="peer sr-only" />
                    <span class="w-10 h-6 rounded-full bg-gray-200 peer-checked:bg-primary-600 relative transition-colors">
                      <span class="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4"></span>
                    </span>
                    <span class="text-sm font-medium text-gray-700">Es gasto de crédito</span>
                  </label>
                </div>

                <div v-if="form.isCredit" class="grid grid-cols-1 gap-4">
                  <!-- Fila 1: Tipo y Estado -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div :class="form.entryType === 'payment' ? '' : 'md:col-span-2'">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de movimiento</label>
                      <AppSelect v-model="form.entryType" :options="entryTypeOptions" placeholder="Selecciona..." size="sm" />
                    </div>
                    <div v-if="form.entryType === 'payment'">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <AppSelect v-model="form.status" :options="statusOptions" placeholder="Selecciona estado" size="sm" />
                    </div>
                  </div>
                  <!-- Fila 2: Crédito (full width) -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Crédito</label>
                    <AppSelect v-model="form.debtId" :options="debtOptions" placeholder="Selecciona un crédito" size="sm" />
                  </div>
                </div>

                <!-- Error message -->
                <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p class="text-sm text-red-600">{{ error }}</p>
                </div>

                <!-- Sticky footer actions -->
              </form>
            </div>
            <div class="px-6 py-4 border-t bg-white sticky bottom-0">
              <div class="flex space-x-3">
                <button type="button" @click="closeModal" class="btn-secondary flex-1">Cancelar</button>
                <button type="button" @click="onSave(false)" :disabled="loading" class="btn-primary flex-1" :class="{ 'opacity-50 cursor-not-allowed': loading }" title="Tip: Ctrl+Enter guarda y crea otro">
                  <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ loading ? (isEditMode ? 'Guardando...' : 'Agregando...') : (isEditMode ? 'Guardar Cambios' : 'Guardar') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { format } from 'date-fns'
import { useExpenseStore } from '../stores/expenseStore'
import AppSelect from './ui/AppSelect.vue'
import AppSwitch from './ui/AppSwitch.vue'
import AppDatePicker from './ui/AppDatePicker.vue'
import { useDebtStore } from '../stores/debtStore'
import { useConfirm } from '../composables/useConfirm'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  expense: {
    type: Object,
    default: null
  }
})



const emit = defineEmits(['close', 'expense-added', 'expense-updated'])

const expenseStore = useExpenseStore()
const debtStore = useDebtStore()
const { show: confirm } = useConfirm()

const form = reactive({
  description: '',
  amount: '',
  categoryId: '',
  date: '',
  isFixed: false,
  dayOfMonth: '',
  entryType: '',
  debtId: '',
  isCredit: false
})
const isEditMode = computed(() => !!props.expense)

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      if (isEditMode.value) {
        // Prefill fields from expense
        form.description = props.expense.description || ''
        form.amount = String(props.expense.amount ?? '')
        form.categoryId = String(props.expense.categoryId ?? '')
        form.date = props.expense.date || format(new Date(), 'yyyy-MM-dd')
        form.isFixed = !!props.expense.isFixed
        // Día del mes: intentar del propio expense o del fixedExpense asociado
        const expDay = props.expense.dayOfMonth
        if (expDay != null && expDay !== '') {
          form.dayOfMonth = String(expDay)
        } else if (props.expense.fixedExpenseId) {
          try {
            const fe = expenseStore.fixedExpenses.find(f => String(f.id) === String(props.expense.fixedExpenseId))
            form.dayOfMonth = fe?.dayOfMonth != null ? String(fe.dayOfMonth) : ''
          } catch {
            form.dayOfMonth = ''
          }
        } else {
          form.dayOfMonth = ''
        }

        // Crédito: setear checkbox y valores si existen
        form.isCredit = !!props.expense.debtId
        form.debtId = props.expense.debtId || ''
        form.entryType = props.expense.entryType ? String(props.expense.entryType).toLowerCase() : ''
        // Prefill status si viene del gasto, respetando edición de pagos
        form.status = props.expense.status ? String(props.expense.status).toLowerCase() : ''
        // Asegurar que las deudas estén cargadas al abrir en modo edición
        try {
          if (!debtStore.debts?.length) {
            debtStore.loadDebts()
          }
        } catch {}
        selectedDate.value = new Date(form.date)
        currentDate.value = new Date(form.date)
      } else {
        resetForm()
      }
    } else {
      // Al cerrar el modal, limpiar el formulario para el próximo uso
      resetForm()
    }
  }
)


const error = ref('')
const descriptionInput = ref(null)
// AppDatePicker maneja su propio panel; no se requiere estado local

// Sin variables del datepicker personalizado

onMounted(async () => {
  if (!expenseStore.categories?.length) {
    await expenseStore.loadCategories()
  }
  if (!debtStore.debts?.length) {
    await debtStore.loadDebts()
  }
  // Inicializar fecha actual
  form.date = format(new Date(), 'yyyy-MM-dd')
})

// Opciones para AppSelect (categorías activas)
const categoryOptions = computed(() =>
  (expenseStore.activeCategories || []).map(c => ({ label: c.name, value: c.id }))
)

const entryTypeOptions = [
  { label: 'Cargo', value: 'charge' },
  { label: 'Abono', value: 'payment' }
]

const debtOptions = computed(() => (debtStore.debts || []).map(d => ({
  label: `${d.name}${d.maskPan ? ' •' + d.maskPan : ''}`,
  value: d.id
})))

const statusOptions = [
  { label: 'Pendiente', value: 'pending' },
  { label: 'Pagado', value: 'paid' }
]

// Sin cálculos del datepicker personalizado

// Focus on description input when modal opens
watch(() => props.isOpen, async (newValue) => {
  if (newValue) {
    await nextTick()
    descriptionInput.value?.focus()
  }
})

const resetForm = () => {
  form.description = ''
  form.amount = ''
  form.categoryId = ''
  form.date = format(new Date(), 'yyyy-MM-dd')
  form.isFixed = false
  form.dayOfMonth = ''
  form.isCredit = false
  form.debtId = ''
  form.entryType = ''
  form.status = ''
  error.value = ''
}

// Métodos para el datepicker
// Selección rápida ahora puede hacerse externamente si se requiere

const closeModal = () => {
  resetForm()
  emit('close')
}

const handleSubmit = async () => {
  try {
    error.value = ''
    
    // Validar que si es fijo, tenga día del mes
    if (form.isFixed && !form.dayOfMonth) {
      error.value = 'Si marcas como gasto fijo, debes especificar el día del mes'
      return
    }
    // Validación para Crédito (por checkbox)
    if (form.isCredit) {
      if (!form.entryType) {
        error.value = 'Debes seleccionar el tipo de movimiento (cargo o pago)'
        return
      }
      if (!form.debtId) {
        error.value = 'Debes seleccionar el crédito al que se aplica'
        return
      }
    }
    
    if (isEditMode.value && props.expense?.id) {
      const payload = { id: props.expense.id, ...form }
      if (!form.isCredit) {
        payload.debtId = null
        delete payload.entryType
        delete payload.status
      } else {
        // Si el usuario no selecciona status para payment manual, usar 'paid'; pero no sobreescribir si ya eligió 'pending'
        if (payload.entryType === 'payment' && !payload.status) payload.status = 'paid'
      }
      await expenseStore.updateExpense(payload)
      emit('expense-updated')
    } else {
      const payload = { ...form }
      if (!form.isCredit) {
        payload.debtId = null
        delete payload.entryType
        delete payload.status
      } else {
        // Para creación manual: por defecto 'paid' solo si no se seleccionó estado
        if (payload.entryType === 'payment' && !payload.status) payload.status = 'paid'
      }
      await expenseStore.addExpense(payload)
      emit('expense-added')
    }
    closeModal()
  } catch (err) {
    error.value = isEditMode.value ? 'Error al actualizar el gasto. Inténtalo de nuevo.' : 'Error al agregar el gasto. Inténtalo de nuevo.'
  }
}

// Acciones footer
const onSave = async (andNew) => {
  await handleSubmit()
  if (andNew && !error.value) {
    // Reabrir limpio si fue creación (no edición)
    if (!isEditMode.value) {
      resetForm()
    }
  }
}

// Ctrl+Enter: Guardar y nuevo
const handleShortcutSave = async (e) => {
  if (!props.isOpen) return
  const isCtrlEnter = (e.ctrlKey || e.metaKey) && e.key === 'Enter'
  if (isCtrlEnter && !loading.value) {
    e.preventDefault()
    await onSave(true)
  }
}

const loading = computed(() => expenseStore.loading)

// Watcher para limpiar el día del mes cuando se desmarca como fijo
watch(() => form.isFixed, (newValue) => {
  if (!newValue) {
    form.dayOfMonth = ''
  }
})

// Default de crédito: al activar, preseleccionar 'charge'; al desactivar, limpiar
watch(() => form.isCredit, (isCredit) => {
  if (isCredit) {
    if (!form.entryType) form.entryType = 'charge'
    // Mantener el status sólo si el usuario lo selecciona; no forzar 'paid' en edición si viene 'pending'
    if (form.entryType === 'payment' && !form.status) {
      // no-op: el usuario podrá elegir; si no elige, se aplicará default al guardar
    }
  } else {
    form.entryType = ''
    form.debtId = ''
    form.status = ''
  }
})

// Close modal with ESC key
const handleKeydown = (event) => {
  if (event.key === 'Escape' && props.isOpen) {
      closeModal()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('keydown', handleShortcutSave)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('keydown', handleShortcutSave)
})
</script>

<style scoped>
.input-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500;
}

.btn-primary {
  @apply inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500;
}


</style>
