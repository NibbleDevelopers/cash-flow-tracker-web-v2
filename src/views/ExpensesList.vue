<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900">Gastos</h1>
      <button
        v-if="showAddButton"
        @click="showModal = true"
        class="btn-primary items-center space-x-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span>Agregar Gasto</span>
      </button>
    </div>

    <!-- Layout Container -->
    <div class="lg:grid lg:grid-cols-3 lg:gap-6">
      <!-- UNA SOLA instancia del componente de gastos -->
      <div class="lg:col-span-2">
        <ExpensesListComponent 
          ref="expensesListRef" 
          @edit-expense="openEdit" 
          @delete-expense="confirmDelete"
          :class="{
            // Mobile: ocultar si no está en tab de gastos
            'hidden lg:block': activeTab !== 'expenses'
          }"
        />
      </div>

      <!-- Sidebar Desktop -->
      <div class="hidden lg:block lg:col-span-1 space-y-6">
        <BudgetProgress amount-size="sm" />
        <FixedExpensesManager />
      </div>
    </div>

    <!-- Mobile: Contenido de otros tabs -->
    <div class="lg:hidden">
      <!-- Tab: Gastos Fijos -->
      <div v-show="activeTab === 'fixed'" class="space-y-4 min-h-[calc(100vh-200px)] pb-20">
        <FixedExpensesManager />
      </div>

      <!-- Tab: Resumen -->
      <div v-show="activeTab === 'summary'" class="space-y-4 min-h-[calc(100vh-200px)] pb-20">
        <BudgetProgress amount-size="sm" />
      </div>
    </div>

    <!-- Bottom Navigation Tabs (solo mobile) -->
    <Teleport to="body">
      <div class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
        <div class="flex">
          <button
            @click="activeTab = 'expenses'"
            :class="[
              'flex-1 py-3 px-2 text-xs font-medium text-center transition-colors duration-200',
              activeTab === 'expenses' 
                ? 'text-primary-600 bg-primary-50' 
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            <div class="flex flex-col items-center space-y-1">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Gastos</span>
            </div>
          </button>
          
          <button
            @click="activeTab = 'fixed'"
            :class="[
              'flex-1 py-3 px-2 text-xs font-medium text-center transition-colors duration-200',
              activeTab === 'fixed' 
                ? 'text-primary-600 bg-primary-50' 
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            <div class="flex flex-col items-center space-y-1">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Fijos</span>
            </div>
          </button>
          
          <button
            @click="activeTab = 'summary'"
            :class="[
              'flex-1 py-3 px-2 text-xs font-medium text-center transition-colors duration-200',
              activeTab === 'summary' 
                ? 'text-primary-600 bg-primary-50' 
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            <div class="flex flex-col items-center space-y-1">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Resumen</span>
            </div>
          </button>
        </div>
      </div>
    </Teleport>

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
      <div class="fixed bottom-20 right-4 z-50 sm:hidden">
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

            <!-- Filtros Avanzados -->
            <button
              @click="openAdvancedFilters"
              class="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors duration-200 group"
            >
              <div class="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors duration-200">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <div>
                <div class="text-sm font-medium">Filtros Avanzados</div>
                <div class="text-xs text-gray-500">Categoría, tipo, período</div>
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
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
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
const activeTab = ref('expenses') // 'expenses' | 'fixed' | 'summary'
const showAddButton = ref(false) // Solo mostrar en desktop
const isDesktop = ref(window.innerWidth >= 1024) // lg breakpoint

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

const openAdvancedFilters = async () => {
  showQuickActions.value = false
  activeTab.value = 'expenses'
  
  // Esperar a que Vue renderice el cambio de tab antes de expandir
  await nextTick()
  
  expensesListRef.value?.expandFilters?.()
}

const openDateFilter = () => {
  showQuickActions.value = false
  expensesListRef.value?.toggleRange?.()
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

// Detectar tamaño de pantalla para mostrar/ocultar botón
const updateScreenSize = () => {
  showAddButton.value = window.innerWidth >= 640
  isDesktop.value = window.innerWidth >= 1024
}

// Inicializar y escuchar cambios de tamaño
onMounted(() => {
  updateScreenSize()
  window.addEventListener('resize', updateScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize)
})
</script>

<style scoped>
.btn-primary {
  @apply inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500;
}
</style>
