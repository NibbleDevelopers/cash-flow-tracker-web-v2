<template>
  <div class="card">
    <h2 class="text-lg font-semibold text-gray-900 mb-4">Configurar Presupuesto Mensual</h2>
    
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="month" class="block text-sm font-medium text-gray-700 mb-1">
          Mes
        </label>
        <input
          id="month"
          v-model="form.month"
          type="month"
          required
          class="input-field"
        />
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

const expenseStore = useExpenseStore()

const form = reactive({
  month: '',
  amount: ''
})

const error = ref('')
const success = ref(false)

onMounted(() => {
  form.month = format(new Date(), 'yyyy-MM')
  if (expenseStore.budget.amount > 0) {
    form.amount = expenseStore.budget.amount.toString()
  }
})

const loading = computed(() => expenseStore.loading)

const handleSubmit = async () => {
  try {
    error.value = ''
    success.value = false
    
    await expenseStore.updateBudget(form)
    success.value = true
    
    // Ocultar mensaje de éxito después de 3 segundos
    setTimeout(() => {
      success.value = false
    }, 3000)
  } catch (err) {
    error.value = 'Error al actualizar el presupuesto. Inténtalo de nuevo.'
  }
}
</script>
