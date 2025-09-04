<template>
  <div class="card">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold text-gray-900">Gastos Fijos</h2>
      <button
        @click="showAddForm = !showAddForm"
        class="btn-primary"
      >
        {{ showAddForm ? 'Cancelar' : 'Agregar Gasto Fijo' }}
      </button>
    </div>

    <!-- Formulario para agregar gasto fijo -->
    <div v-if="showAddForm" class="mb-6 p-4 bg-gray-50 rounded-lg">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Gasto
          </label>
          <input
            id="name"
            v-model="form.name"
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
            {{ loading ? 'Agregando...' : 'Agregar Gasto Fijo' }}
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
    </div>

    <!-- Lista de gastos fijos -->
    <div v-if="expenseStore.activeFixedExpenses.length === 0" class="text-center py-8">
      <div class="text-gray-400 mb-2">
        <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p class="text-gray-500">No hay gastos fijos configurados</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="fixedExpense in expenseStore.activeFixedExpenses"
        :key="fixedExpense.id"
        class="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
      >
        <div class="flex-1">
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {{ getCategoryName(fixedExpense.categoryId) }}
              </span>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-900">{{ fixedExpense.name }}</h3>
              <p class="text-xs text-gray-500">Día {{ fixedExpense.dayOfMonth }} de cada mes</p>
            </div>
          </div>
        </div>
        <div class="text-right">
          <p class="text-sm font-semibold text-gray-900">
            ${{ fixedExpense.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
          </p>
          <button
            @click="editFixedExpense(fixedExpense)"
            class="text-xs text-blue-600 hover:text-blue-800 mt-1"
          >
            Editar
          </button>
        </div>
      </div>
    </div>

    <!-- Botón para generar gastos fijos del mes -->
    <div v-if="expenseStore.activeFixedExpenses.length > 0" class="mt-6 pt-4 border-t border-gray-200">
      <div class="flex justify-between items-center">
        <div>
          <p class="text-sm text-gray-600">
            Generar gastos fijos para {{ currentMonth }}
          </p>
          <p class="text-xs text-gray-500">
            Esto creará automáticamente los gastos fijos para el mes actual
          </p>
        </div>
        <button
          @click="generateFixedExpenses"
          :disabled="loading"
          class="btn-secondary"
          :class="{ 'opacity-50 cursor-not-allowed': loading }"
        >
          {{ loading ? 'Generando...' : 'Generar Gastos' }}
        </button>
      </div>
    </div>

    <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-sm text-red-600">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { format } from 'date-fns'
import { useExpenseStore } from '../stores/expenseStore'

const expenseStore = useExpenseStore()

const showAddForm = ref(false)
const error = ref('')

const form = reactive({
  name: '',
  amount: '',
  categoryId: '',
  dayOfMonth: ''
})

const currentMonth = computed(() => format(new Date(), 'yyyy-MM'))

const resetForm = () => {
  form.name = ''
  form.amount = ''
  form.categoryId = ''
  form.dayOfMonth = ''
  error.value = ''
}

const handleSubmit = async () => {
  try {
    error.value = ''
    await expenseStore.addFixedExpense(form)
    resetForm()
    showAddForm.value = false
  } catch (err) {
    error.value = 'Error al agregar el gasto fijo. Inténtalo de nuevo.'
  }
}

const editFixedExpense = (fixedExpense) => {
  // TODO: Implementar edición
  console.log('Editar gasto fijo:', fixedExpense)
}

const generateFixedExpenses = async () => {
  try {
    error.value = ''
    await expenseStore.generateFixedExpensesForMonth(currentMonth.value)
    error.value = 'Gastos fijos generados correctamente para este mes'
    setTimeout(() => {
      error.value = ''
    }, 3000)
  } catch (err) {
    error.value = 'Error al generar gastos fijos. Inténtalo de nuevo.'
  }
}

const getCategoryName = (categoryId) => {
  const category = expenseStore.categories.find(c => c.id === categoryId)
  return category ? category.name : 'Categoría no encontrada'
}

const loading = computed(() => expenseStore.loading)
</script>
