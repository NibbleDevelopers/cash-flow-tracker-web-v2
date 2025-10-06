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
        <ExpensesListComponent ref="expensesListRef" @edit-expense="openEdit" @delete-expense="confirmDelete" />
      </div>
      
      <div class="lg:col-span-1 space-y-6">
        <BudgetProgress amount-size="sm" />
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

    <!-- Quick Actions Flotante (solo mobile) -->
    <Teleport to="body">
      <div class="fixed bottom-4 right-4 z-50 sm:hidden">
        <!-- Botón Principal -->
        <button
          @click="toggleQuickActions"
          class="w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary-500/30 group"
          :class="{ 'rotate-45': showQuickActions }"
          aria-label="Acciones rápidas"
          title="Acciones rápidas"
        >
          <svg 
            class="w-6 h-6 mx-auto transition-transform duration-300" 
            :class="{ 'rotate-45': showQuickActions }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>

        <!-- Menú de Acciones -->
        <div v-if="showQuickActions" class="absolute bottom-16 right-0 mb-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-[60]">
            <!-- Agregar Gasto -->
            <button
              @click="openAddExpense"
              class="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors duration-200 group"
            >
              <div class="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-200 transition-colors duration-200">
                <svg class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <div class="text-sm font-medium">Agregar Gasto</div>
                <div class="text-xs text-gray-500">Nuevo gasto rápido</div>
              </div>
            </button>

            <!-- Filtrar por Categoría -->
            <button
              @click="openCategoryFilter"
              class="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors duration-200 group"
            >
              <div class="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors duration-200">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <div class="text-sm font-medium">Filtrar Categoría</div>
                <div class="text-xs text-gray-500">Ver por categoría</div>
              </div>
            </button>

            <!-- Filtrar por Fecha -->
            <button
              @click="openDateFilter"
              class="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors duration-200 group"
            >
              <div class="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-200 transition-colors duration-200">
                <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div class="text-sm font-medium">Filtrar Fecha</div>
                <div class="text-xs text-gray-500">Rango personalizado</div>
              </div>
            </button>
        </div>

        <!-- Overlay para cerrar -->
        <div 
          v-if="showQuickActions" 
          class="fixed inset-0 z-40" 
          @click="showQuickActions = false"
        ></div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ExpenseModal from '../components/ExpenseModal.vue'
import { notify } from '../services/notifications.js'
import ExpensesListComponent from '../components/ExpensesList.vue'
import BudgetProgress from '../components/BudgetProgress.vue'
import FixedExpensesManager from '../components/FixedExpensesManager.vue'
import { useExpenseStore } from '../stores/expenseStore'

const expenseStore = useExpenseStore()
const showModal = ref(false)
const editingExpense = ref(null)
const showQuickActions = ref(false)
const expensesListRef = ref(null)

const openEdit = (expense) => {
  editingExpense.value = expense
  showModal.value = true
}

const openAddExpense = () => {
  editingExpense.value = null
  showModal.value = true
  showQuickActions.value = false
}

const toggleQuickActions = () => {
  showQuickActions.value = !showQuickActions.value
}

const openCategoryFilter = () => {
  showQuickActions.value = false
  // Solo funciona en mobile
  if (window.innerWidth >= 640) return
  
  // Expandir filtros en mobile si están colapsados
  if (expensesListRef.value) {
    expensesListRef.value.expandFiltersAndFocusCategory()
  }
}

const openDateFilter = () => {
  showQuickActions.value = false
  // Solo funciona en mobile
  if (window.innerWidth >= 640) return
  
  // Abrir el calendario de rango
  if (expensesListRef.value) {
    expensesListRef.value.expandFiltersAndOpenDateRange()
  }
}

const confirmDelete = async (expense) => {
  // Delegado al componente hijo con dialog; este es fallback si se usa el evento
  try {
    await expenseStore.deleteExpense(expense.id)
    notify.success('Gasto eliminado')
  } catch (e) {
    notify.error('No se pudo eliminar el gasto')
  }
}

const closeModal = () => {
  showModal.value = false
  editingExpense.value = null
}

const afterChange = () => { closeModal(); notify.success('Cambios guardados') }
</script>

<style scoped>
.btn-primary {
  @apply inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500;
}
</style>
