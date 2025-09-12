<template>
  <div class="card">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold text-gray-900">Gastos Fijos</h2>
        <div class="flex space-x-2">
          <button @click="openCreate" class="btn-primary">Agregar Gasto Fijo</button>
        </div>
      </div>

    <!-- Formulario inline eliminado en favor del modal -->

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
          <div class="mt-2 flex justify-end gap-2">
            <button
              class="p-1.5 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-primary-700"
              title="Editar"
              @click="editFixedExpense(fixedExpense)"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5h2m-6 14h10a2 2 0 002-2v-5.586a1 1 0 00-.293-.707l-6.414-6.414A1 1 0 0011.586 4H6a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </button>
            <button
              class="p-1.5 rounded-md border border-gray-200 bg-white text-red-600 hover:bg-red-50"
              title="Eliminar"
              @click="onDeleteFixed(fixedExpense)"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0V5a2 2 0 012-2h2a2 2 0 012 2v2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Botón para generar gastos fijos del mes -->
    <div v-if="expenseStore.activeFixedExpenses.length > 0" class="mt-6 pt-4 border-t border-gray-200">
      <div class="flex justify-between items-center">
        <div>
          <p class="text-sm text-gray-600">
            Generar gastos fijos para {{ formatMonthName(selectedMonth) }}
          </p>
          <p class="text-xs text-gray-500">
            Esto creará automáticamente los gastos fijos para el mes seleccionado
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <select
            v-model="selectedMonth"
            class="text-sm border border-gray-300 rounded-md px-2 py-1"
          >
            <option :value="currentMonth">{{ formatMonthName(currentMonth) }}</option>
            <option :value="nextMonth">{{ formatMonthName(nextMonth) }}</option>
          </select>
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
    </div>

    <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-sm text-red-600">{{ error }}</p>
    </div>

    <!-- Modal de edición de gasto fijo -->
    <FixedExpenseModal
      :is-open="showEdit"
      :fixed-expense="editing"
      mode="edit"
      @close="onCloseEdit"
      @updated="onUpdated"
    />

    <!-- Modal de creación de gasto fijo -->
    <FixedExpenseModal
      :is-open="creating"
      mode="create"
      @close="onCloseCreate"
      @created="onCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import { useExpenseStore } from '../stores/expenseStore'
import FixedExpenseModal from './FixedExpenseModal.vue'
import { useConfirm } from '../composables/useConfirm'
import { notify } from '../services/notifications.js'

const expenseStore = useExpenseStore()
const confirm = useConfirm()

const error = ref('')

const currentMonth = computed(() => format(new Date(), 'yyyy-MM'))
const nextMonth = computed(() => format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1), 'yyyy-MM'))
const selectedMonth = ref(format(new Date(), 'yyyy-MM'))

const formatMonthName = (monthStr) => {
  const [year, month] = monthStr.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
  return format(date, 'MMMM yyyy')
}

const openCreate = () => { creating.value = true }

const editFixedExpense = (fixedExpense) => {
  editing.value = fixedExpense
  showEdit.value = true
}

const onDeleteFixed = async (fixedExpense) => {
  const ok = await confirm.show({
    title: 'Eliminar gasto fijo',
    message: '¿Seguro que deseas eliminar este gasto fijo?',
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    variant: 'danger'
  })
  if (!ok) return
  
  try {
    await expenseStore.deleteFixedExpense(fixedExpense.id)
    notify.success('Gasto fijo eliminado')
  } catch (error) {
    console.error('Error eliminando gasto fijo:', error)
    notify.error('No se pudo eliminar el gasto fijo')
  }
}

const generateFixedExpenses = async () => {
  try {
    error.value = ''
    await expenseStore.generateFixedExpensesForMonth(selectedMonth.value)
    notify.success(`Gastos fijos generados correctamente para ${formatMonthName(selectedMonth.value)}`)
  } catch (err) {
    error.value = 'Error al generar gastos fijos. Inténtalo de nuevo.'
    console.error('Error generando gastos fijos:', err)
    notify.error('No se pudieron generar los gastos fijos')
  }
}

const getCategoryName = (categoryId) => {
  const category = expenseStore.categories.find(c => c.id === categoryId)
  return category ? category.name : 'Categoría no encontrada'
}

const loading = computed(() => expenseStore.loading)

const showEdit = ref(false)
const editing = ref(null)
const creating = ref(false)
const onCloseEdit = () => { showEdit.value = false; editing.value = null }
const onUpdated = () => { onCloseEdit(); notify.success('Gasto fijo actualizado') }
const onCloseCreate = () => { creating.value = false }
const onCreated = () => { creating.value = false; notify.success('Gasto fijo creado') }
</script>
