<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <Notivue v-slot="item">
      <Notification :item="item" />
    </Notivue>
    <div id="confirm"></div>
    <nav class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40" role="navigation" aria-label="Navegación principal">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo/Título -->
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">{{ appTitle }}</h1>
          </div>
          
          <!-- Menú Desktop -->
          <div class="hidden md:flex items-center space-x-1" role="menubar">
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

          <!-- Botón Hamburguesa Mobile -->
          <div class="md:hidden flex items-center">
            <button
              @click="toggleMobileMenu"
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              aria-expanded="mobileMenuOpen"
              aria-controls="mobile-menu"
              aria-label="Abrir menú principal"
            >
              <svg 
                class="h-6 w-6" 
                :class="{ 'hidden': mobileMenuOpen, 'block': !mobileMenuOpen }" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg 
                class="h-6 w-6" 
                :class="{ 'block': mobileMenuOpen, 'hidden': !mobileMenuOpen }" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Menú Mobile (despliega hacia abajo) -->
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="transform opacity-0 scale-95"
          enter-to-class="transform opacity-100 scale-100"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="transform opacity-100 scale-100"
          leave-to-class="transform opacity-0 scale-95"
        >
          <div 
            v-show="mobileMenuOpen" 
            id="mobile-menu"
            class="md:hidden border-t border-gray-200 bg-white shadow-lg"
            role="menu"
            aria-orientation="vertical"
          >
            <div class="px-2 pt-2 pb-3 space-y-1">
              <router-link 
                to="/" 
                @click="closeMobileMenu"
                class="flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                :class="$route.path === '/' 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'"
                role="menuitem"
                aria-current="$route.path === '/' ? 'page' : undefined"
              >
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Gastos
              </router-link>
              <router-link 
                to="/debts" 
                @click="closeMobileMenu"
                class="flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                :class="$route.path === '/debts' 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'"
                role="menuitem"
                aria-current="$route.path === '/debts' ? 'page' : undefined"
              >
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Créditos
              </router-link>
              <router-link 
                to="/budget" 
                @click="closeMobileMenu"
                class="flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                :class="$route.path === '/budget' 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'"
                role="menuitem"
                aria-current="$route.path === '/budget' ? 'page' : undefined"
              >
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Presupuesto
              </router-link>
              <router-link 
                to="/summary" 
                @click="closeMobileMenu"
                class="flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                :class="$route.path === '/summary' 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'"
                role="menuitem"
                aria-current="$route.path === '/summary' ? 'page' : undefined"
              >
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Resumen
              </router-link>
            </div>
          </div>
        </Transition>
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
import { onMounted, ref } from 'vue'
import { Notivue, Notification } from 'notivue'
import ConfirmDialog from './components/ui/ConfirmDialog.vue'
import { useExpenseStore } from './stores/expenseStore'
import { useDebtStore } from './stores/debtStore'

const expenseStore = useExpenseStore()
const debtStore = useDebtStore()
const appTitle = ref(import.meta.env.VITE_APP_TITLE)

// Estado del menú mobile
const mobileMenuOpen = ref(false)

// Funciones para manejar el menú mobile
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

onMounted(async () => {
  await expenseStore.loadExpenses()
  await expenseStore.loadCategories()
  await expenseStore.loadBudget()
  await expenseStore.loadFixedExpenses()
  await debtStore.loadDebts()
})

</script>
