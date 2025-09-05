<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900">Gastos</h1>
      <button
        @click="showModal = true"
        class="btn-primary inline-flex items-center space-x-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span>Agregar Gasto</span>
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <ExpensesListComponent @edit-expense="openEdit" @delete-expense="confirmDelete" />
      </div>
      
      <div class="lg:col-span-1 space-y-6">
        <BudgetProgress />
        <FixedExpensesManager />
      </div>
    </div>

    <!-- Modal para agregar gastos -->
    <ExpenseModal 
      :is-open="showModal"
      :expense="editingExpense"
      @close="closeModal"
      @expense-added="afterChange"
      @expense-updated="afterChange"
    />

    <!-- Floating Action Button para móvil -->
    <div class="lg:hidden fixed bottom-6 right-6 z-30">
      <button
        @click="showModal = true"
        class="btn-primary rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ExpenseModal from '../components/ExpenseModal.vue'
import ExpensesListComponent from '../components/ExpensesList.vue'
import BudgetProgress from '../components/BudgetProgress.vue'
import FixedExpensesManager from '../components/FixedExpensesManager.vue'
import { useExpenseStore } from '../stores/expenseStore'

const expenseStore = useExpenseStore()
const showModal = ref(false)
const editingExpense = ref(null)

const openEdit = (expense) => {
  editingExpense.value = expense
  showModal.value = true
}

const confirmDelete = async (expense) => {
  const confirmed = window.confirm('¿Eliminar este gasto?')
  if (!confirmed) return
  try {
    await expenseStore.deleteExpense(expense.id)
  } catch (e) {
    // noop (error ya gestionado en store)
  }
}

const closeModal = () => {
  showModal.value = false
  editingExpense.value = null
}

const afterChange = () => {
  closeModal()
}
</script>

<style scoped>
.btn-primary {
  @apply inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500;
}
</style>
