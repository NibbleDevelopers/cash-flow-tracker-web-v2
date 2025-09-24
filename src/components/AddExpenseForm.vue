<template>
  <div class="card">
    <h2 class="text-lg font-semibold text-gray-900 mb-4">Agregar Gasto</h2>
    
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
        />
      </div>

      <div>
        <label for="amount" class="block text-sm font-medium text-gray-700 mb-1">
          Monto
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

      <div>
        <label for="category" class="block text-sm font-medium text-gray-700 mb-1">
          Categoría
        </label>
        <select
          id="category"
          v-model="form.categoryId"
          class="input-field"
          required
        >
          <option value="">Selecciona una categoría</option>
          <option 
            v-for="category in expenseStore.activeCategories" 
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>
      </div>

      <div class="flex items-center space-x-3">
        <input id="isCredit" v-model="form.isCredit" type="checkbox" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
        <label for="isCredit" class="text-sm font-medium text-gray-700">Es gasto de crédito</label>
      </div>

      <div v-if="form.isCredit" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de movimiento</label>
          <AppSelect v-model="form.entryType" :options="entryTypeOptions" placeholder="Selecciona..." />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Crédito</label>
          <AppSelect v-model="form.debtId" :options="debtOptions" placeholder="Selecciona un crédito" />
        </div>
      </div>

      <div>
        <label for="date" class="block text-sm font-medium text-gray-700 mb-1">
          Fecha
        </label>
        <input
          id="date"
          v-model="form.date"
          type="date"
          required
          class="input-field"
        />
      </div>

      <!-- Checkbox para marcar como gasto fijo -->
      <div class="flex items-center space-x-3">
        <input
          id="isFixed"
          v-model="form.isFixed"
          type="checkbox"
          class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label for="isFixed" class="text-sm font-medium text-gray-700">
          Es un gasto fijo (se repite cada mes)
        </label>
      </div>

      <!-- Campo para día del mes (solo visible si es fijo) -->
      <div v-if="form.isFixed">
        <label for="dayOfMonth" class="block text-sm font-medium text-gray-700 mb-1">
          Día del mes
        </label>
        <input
          id="dayOfMonth"
          v-model="form.dayOfMonth"
          type="number"
          min="1"
          max="31"
          required
          class="input-field"
          placeholder="15"
        />
        <p class="text-xs text-gray-500 mt-1">
          El gasto se generará automáticamente este día de cada mes
        </p>
      </div>

      <div class="flex space-x-3">
        <button
          type="submit"
          :disabled="loading"
          class="btn-primary flex-1"
          :class="{ 'opacity-50 cursor-not-allowed': loading }"
        >
          {{ loading ? 'Agregando...' : 'Agregar Gasto' }}
        </button>
        <button
          type="button"
          @click="resetForm"
          class="btn-secondary"
        >
          Limpiar
        </button>
      </div>
    </form>

    <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-sm text-red-600">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { format } from 'date-fns'
import { useExpenseStore } from '../stores/expenseStore'
import { useDebtStore } from '../stores/debtStore'
import AppSelect from './ui/AppSelect.vue'

const expenseStore = useExpenseStore()
const debtStore = useDebtStore()

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

const error = ref('')

onMounted(async () => {
  form.date = format(new Date(), 'yyyy-MM-dd')
  if (!expenseStore.categories?.length) {
    await expenseStore.loadCategories()
  }
  if (!debtStore.debts?.length) {
    await debtStore.loadDebts()
  }
})

const resetForm = () => {
  form.description = ''
  form.amount = ''
  form.categoryId = ''
  form.date = format(new Date(), 'yyyy-MM-dd')
  form.isFixed = false
  form.dayOfMonth = ''
  form.entryType = ''
  form.debtId = ''
  form.isCredit = false
  error.value = ''
}

const handleSubmit = async () => {
  try {
    error.value = ''
    
    // Validar que si es fijo, tenga día del mes
    if (form.isFixed && !form.dayOfMonth) {
      error.value = 'Si marcas como gasto fijo, debes especificar el día del mes'
      return
    }

    // Validación para Crédito (por debtId)
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
    
    const payload = { ...form }
    if (!form.isCredit) {
      payload.debtId = null
      delete payload.entryType
    }
    await expenseStore.addExpense(payload)
    resetForm()
  } catch (err) {
    error.value = 'Error al agregar el gasto. Inténtalo de nuevo.'
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
  } else {
    form.entryType = ''
    form.debtId = ''
  }
})

// Opciones selects
const entryTypeOptions = [
  { label: 'Cargo', value: 'charge' },
  { label: 'Pago', value: 'payment' }
]
const debtOptions = computed(() => (debtStore.debts || []).map(d => ({
  label: `${d.name}${d.maskPan ? ' •' + d.maskPan : ''}`,
  value: d.id
})))
</script>
