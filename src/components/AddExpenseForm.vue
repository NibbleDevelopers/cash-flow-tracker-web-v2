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

const expenseStore = useExpenseStore()

const form = reactive({
  description: '',
  amount: '',
  categoryId: '',
  date: '',
  isFixed: false,
  dayOfMonth: ''
})

const error = ref('')

onMounted(async () => {
  form.date = format(new Date(), 'yyyy-MM-dd')
  if (!expenseStore.categories?.length) {
    await expenseStore.loadCategories()
  }
})

const resetForm = () => {
  form.description = ''
  form.amount = ''
  form.categoryId = ''
  form.date = format(new Date(), 'yyyy-MM-dd')
  form.isFixed = false
  form.dayOfMonth = ''
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
    
    await expenseStore.addExpense(form)
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
</script>
