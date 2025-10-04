<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <Notivue v-slot="item">
      <Notification :item="item" />
    </Notivue>
    <div id="confirm"></div>
    <nav class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40" role="navigation" aria-label="Navegación principal">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">{{ appTitle }}</h1>
          </div>
          <div class="flex items-center space-x-1" role="menubar">
            <router-link 
              to="/" 
              class="flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              :class="$route.path === '/' 
                ? 'bg-primary-50 text-primary-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'"
              role="menuitem"
              aria-current="$route.path === '/' ? 'page' : undefined"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Gastos
            </router-link>
            <router-link 
              to="/debts" 
              class="flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              :class="$route.path === '/debts' 
                ? 'bg-primary-50 text-primary-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'"
              role="menuitem"
              aria-current="$route.path === '/debts' ? 'page' : undefined"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Créditos
            </router-link>
            <router-link 
              to="/budget" 
              class="flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              :class="$route.path === '/budget' 
                ? 'bg-primary-50 text-primary-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'"
              role="menuitem"
              aria-current="$route.path === '/budget' ? 'page' : undefined"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Presupuesto
            </router-link>
            <router-link 
              to="/summary" 
              class="flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              :class="$route.path === '/summary' 
                ? 'bg-primary-50 text-primary-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'"
              role="menuitem"
              aria-current="$route.path === '/summary' ? 'page' : undefined"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Resumen
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8" role="main" aria-label="Contenido principal">
      <div v-motion="{ initial: { opacity: 0, y: 6 }, enter: { opacity: 1, y: 0, transition: { duration: 0.3 } } }">
        <router-view />
      </div>
    </main>
    <ConfirmDialog />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { Notivue, Notification } from 'notivue'
import ConfirmDialog from './components/ui/ConfirmDialog.vue'
import { useExpenseStore } from './stores/expenseStore'
import { useDebtStore } from './stores/debtStore'
import { ref } from 'vue'

const expenseStore = useExpenseStore()
const debtStore = useDebtStore()
const appTitle = ref(import.meta.env.VITE_APP_TITLE)
onMounted(async () => {

  await expenseStore.loadExpenses()
  await expenseStore.loadCategories()
  await expenseStore.loadBudget()
  await expenseStore.loadFixedExpenses()
  await debtStore.loadDebts()
})

</script>
