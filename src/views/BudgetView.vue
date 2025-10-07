<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Presupuesto</h1>
        <p class="text-sm sm:text-base text-gray-600 mt-1">Configura y gestiona tu presupuesto mensual</p>
      </div>
      <button
        v-if="showAddButton"
        @click="showModal = true"
        class="btn-primary inline-flex items-center space-x-2 w-full sm:w-auto"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span class="sm:hidden">Agregar Gasto</span>
        <span class="hidden sm:inline">Agregar Gasto</span>
      </button>
    </div>

    <div class="card" role="group" aria-label="Selector anual de presupuestos" tabindex="0" @keydown.left.prevent="prevYear" @keydown.right.prevent="nextYear">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 class="text-lg font-semibold text-gray-900">Presupuestos del Año</h2>
        <div class="flex items-center gap-2">
          <button class="px-3 py-1.5 text-sm rounded border hover:bg-gray-50 transition-colors duration-200" @click="prevYear" aria-label="Año anterior">{{ currentYear - 1 }}</button>
          <span class="text-sm text-gray-700 font-medium px-2">{{ currentYear }}</span>
          <button class="px-3 py-1.5 text-sm rounded border hover:bg-gray-50 transition-colors duration-200" @click="nextYear" aria-label="Año siguiente">{{ currentYear + 1 }}</button>
          <button class="ml-2 px-3 py-1.5 text-sm rounded border hover:bg-gray-50 transition-colors duration-200" @click="goToCurrentYear" aria-label="Volver al año actual">Hoy</button>
        </div>
      </div>
      <div v-if="isLoadingBudgets" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div v-for="i in 12" :key="i" class="p-4 rounded-lg border border-gray-200 bg-gray-50 animate-pulse h-16"></div>
      </div>
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <button
          v-for="(label, idx) in monthLabels"
          :key="label"
          class="p-4 rounded-lg border text-left transition-all duration-200 hover:shadow-md hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          :class="tileClass(idx)"
          @click="openEdit(idx)"
          role="button"
          :aria-current="isCurrentMonth(idx) ? 'date' : 'false'"
          :aria-label="`Editar presupuesto de ${label} ${currentYear}: ${getAmountFor(idx).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`"
          v-motion
          :initial="{ opacity: 0, y: 10 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 0.25, delay: (idx % 4) * 0.05 } }"
        >
          <div class="flex flex-col justify-between h-full">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium" :class="isCurrentMonth(idx) ? 'text-primary-700' : 'text-gray-900'">{{ label }}</span>
              <div v-if="isCurrentMonth(idx)" class="w-2 h-2 bg-primary-500 rounded-full"></div>
            </div>
            <div class="text-right">
              <span v-if="getAmountFor(idx) > 0" class="text-xs font-semibold" :class="isCurrentMonth(idx) ? 'text-primary-600' : 'text-gray-600'">${{ getAmountFor(idx).toLocaleString('es-ES', { minimumFractionDigits: 0 }) }}</span>
              <span v-else class="text-xs text-gray-400">Configurar</span>
            </div>
          </div>
        </button>
      </div>
      <div v-if="!isLoadingBudgets && !hasAnyBudgetForYear" class="mt-3 text-sm text-gray-500">Aún no hay presupuestos para este año.</div>
    </div>

    <div class="grid grid-cols-1 gap-6">
      <BudgetProgress />
    </div>

    <!-- Modal editar presupuesto del mes -->
    <Teleport to="body">
      <Transition
        enter-active-class="ease-out duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="ease-in duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="isMonthModalOpen" class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" @click="closeMonthModal"></div>
      </Transition>
      <Transition
        enter-active-class="ease-out duration-500"
        enter-from-class="opacity-0 translate-y-8 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="ease-in duration-300"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-8 scale-95"
      >
        <div v-if="isMonthModalOpen" class="fixed inset-0 z-50 overflow-y-auto" @click.self="closeMonthModal" role="dialog" aria-modal="true" :aria-labelledby="modalTitleId">
          <div class="flex min-h-full items-center justify-center p-4 text-center">
            <div 
              class="relative transform overflow-hidden bg-white text-left shadow-xl transition-all w-full max-w-md rounded-lg"
            >
              <div class="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-semibold text-white" :id="modalTitleId">Editar presupuesto — {{ editMonthLabel }}</h3>
                  <button @click="closeMonthModal" class="rounded-md text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600">
                    <span class="sr-only">Cerrar</span>
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div class="px-6 py-6 space-y-4">
                <div>
                  <label for="budget-modal-amount" class="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                  <input id="budget-modal-amount" ref="amountInputRef" v-model="amountInput" type="number" inputmode="decimal" step="0.01" min="0" max="100000000" class="input-field" placeholder="0.00" @keydown.enter.prevent="saveBudget" />
                  <div class="flex justify-between mt-2">
                    <button v-if="canDuplicatePrev" type="button" class="text-xs text-gray-600 hover:text-gray-800" @click="duplicatePrev">Duplicar mes anterior</button>
                    <button type="button" class="text-xs text-primary-600 hover:text-primary-700" @click="applyToNextMonths">Aplicar a próximos meses</button>
                  </div>
                </div>
                <div v-if="formError" class="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">{{ formError }}</div>
                <div class="flex gap-3 pt-2">
                  <button type="button" class="btn-secondary flex-1" @click="closeMonthModal">Cancelar</button>
                  <button type="button" class="btn-primary flex-1" :disabled="saving" :class="{ 'opacity-50 cursor-not-allowed': saving }" @click="saveBudget">
                    <svg v-if="saving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ saving ? 'Guardando...' : 'Guardar' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    

    <!-- Modal para agregar gastos -->
    <ExpenseModal 
      :is-open="showModal"
      @close="showModal = false"
      @expense-added="handleExpenseAdded"
    />

    <!-- Floating Action Button para móvil -->
    <Teleport to="body">
      <div v-if="!showAddButton" class="fixed bottom-20 right-4 sm:hidden z-40">
        <button
          @click="showModal = true"
          class="w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-primary-200"
          aria-label="Agregar gasto"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUpdated, onUnmounted, nextTick, Teleport, Transition } from 'vue'
import BudgetForm from '../components/BudgetForm.vue'
import BudgetProgress from '../components/BudgetProgress.vue'
import ExpenseModal from '../components/ExpenseModal.vue'
import { useExpenseStore } from '../stores/expenseStore'
import { format } from 'date-fns'
import { notify } from '../services/notifications.js'

const showModal = ref(false)
const showAddButton = ref(true)

const handleExpenseAdded = () => {
  // El modal se cierra automáticamente después de agregar el gasto
  // Aquí podrías agregar lógica adicional si es necesario
}

// Actualizar visibilidad del botón según el tamaño de pantalla
const updateScreenSize = () => {
  showAddButton.value = window.innerWidth >= 640
}

const expenseStore = useExpenseStore()
const yearCursor = ref(new Date())
const currentYear = computed(() => yearCursor.value.getFullYear())
const monthLabels = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const isLoadingBudgets = ref(false)
onMounted(async () => {
  isLoadingBudgets.value = true
  await expenseStore.loadBudgets()
  isLoadingBudgets.value = false
  
  // Configurar visibilidad del botón
  updateScreenSize()
  window.addEventListener('resize', updateScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize)
})

const ym = (y, mIdx) => `${y}-${String(mIdx + 1).padStart(2,'0')}`
const getAmountFor = (mIdx) => {
  const key = ym(currentYear.value, mIdx)
  return expenseStore.budgetsByMonth[key] || 0
}
const hasAnyBudgetForYear = computed(() => {
  for (let i = 0; i < 12; i++) if (getAmountFor(i) > 0) return true
  return false
})
const isCurrentMonth = (mIdx) => {
  const now = new Date()
  return currentYear.value === now.getFullYear() && mIdx === now.getMonth()
}
const goToCurrentYear = () => {
  const d = new Date()
  yearCursor.value = d
}
const tileClass = (mIdx) => {
  const amount = getAmountFor(mIdx)
  return amount > 0 ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
}
const prevYear = () => {
  const d = new Date(yearCursor.value)
  d.setFullYear(d.getFullYear() - 1)
  yearCursor.value = d
}
const nextYear = () => {
  const d = new Date(yearCursor.value)
  d.setFullYear(d.getFullYear() + 1)
  yearCursor.value = d
}
const openEdit = (mIdx) => {
  const month = ym(currentYear.value, mIdx)
  editMonth.value = month
  amountInput.value = String(getAmountFor(mIdx) || '')
  isMonthModalOpen.value = true
}

const isMonthModalOpen = ref(false)
const editMonth = ref('')
const amountInput = ref('')
const saving = ref(false)
const formError = ref('')
const editMonthLabel = computed(() => {
  if (!editMonth.value) return ''
  const [y, m] = editMonth.value.split('-').map(Number)
  return format(new Date(y, (m || 1) - 1, 1), 'MMMM yyyy')
})
const modalTitleId = 'budget-edit-title'
const amountInputRef = ref(null)
onUpdated(async () => {
  if (isMonthModalOpen.value) {
    await nextTick()
    amountInputRef.value && amountInputRef.value.focus()
  }
})

const closeMonthModal = () => {
  isMonthModalOpen.value = false
  editMonth.value = ''
  amountInput.value = ''
  formError.value = ''
}

const saveBudget = async () => {
  try {
    formError.value = ''
    const amount = parseFloat(String(amountInput.value).trim())
    if (isNaN(amount) || amount < 0) {
      formError.value = 'Ingresa un monto válido'
      return
    }
    saving.value = true
    // Optimista: actualizar mapa localmente y revertir en caso de error
    const prev = expenseStore.budgetsByMonth[editMonth.value]
    expenseStore.budgetsByMonth[editMonth.value] = amount
    try {
      await useExpenseStore().updateBudget({ month: editMonth.value, amount })
      await expenseStore.loadBudgets()
    } catch (e) {
      expenseStore.budgetsByMonth[editMonth.value] = prev
      throw e
    }
    notify.success('Presupuesto guardado')
    closeMonthModal()
  } catch (e) {
    notify.error('No se pudo guardar el presupuesto')
  } finally {
    saving.value = false
  }
}

// Acciones rápidas
const canDuplicatePrev = computed(() => {
  if (!editMonth.value) return false
  const [y, m] = editMonth.value.split('-').map(Number)
  const prevMonth = new Date(y, (m || 1) - 2, 1)
  const key = ym(prevMonth.getFullYear(), prevMonth.getMonth())
  return (expenseStore.budgetsByMonth[key] || 0) > 0
})
const duplicatePrev = () => {
  if (!canDuplicatePrev.value) return
  const [y, m] = editMonth.value.split('-').map(Number)
  const prevMonth = new Date(y, (m || 1) - 2, 1)
  const key = ym(prevMonth.getFullYear(), prevMonth.getMonth())
  const amount = expenseStore.budgetsByMonth[key] || 0
  amountInput.value = String(amount)
}

// (Se eliminó formateo abreviado; se muestra monto exacto)
const applyToNextMonths = async () => {
  try {
    const baseAmount = parseFloat(String(amountInput.value))
    if (isNaN(baseAmount) || baseAmount < 0) {
      formError.value = 'Ingresa un monto válido para aplicar'
      return
    }
    saving.value = true
    const [y, m] = editMonth.value.split('-').map(Number)
    const ops = []
    for (let i = (m || 1) - 1; i < 12; i++) {
      const key = ym(y, i)
      // Optimista
      const prev = expenseStore.budgetsByMonth[key]
      expenseStore.budgetsByMonth[key] = baseAmount
      ops.push({ key, prev })
    }
    try {
      for (let i = (m || 1) - 1; i < 12; i++) {
        const key = ym(y, i)
        await useExpenseStore().updateBudget({ month: key, amount: baseAmount })
      }
      await expenseStore.loadBudgets()
      notify.success('Aplicado a los próximos meses')
    } catch (e) {
      // revertir
      for (const { key, prev } of ops) expenseStore.budgetsByMonth[key] = prev
      throw e
    }
  } catch (e) {
    notify.error('No se pudo aplicar a próximos meses')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.btn-primary {
  @apply inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500;
}
</style>
