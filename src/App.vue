<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <Notivue v-slot="item">
      <Notification :item="item" />
    </Notivue>
    <div id="confirm"></div>
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">{{ appTitle }}</h1>
          </div>
          <div class="flex items-center space-x-4">
            <router-link 
              to="/" 
              class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              :class="{ 'text-primary-600': $route.path === '/' }"
            >
              Gastos
            </router-link>
            <router-link 
              to="/budget" 
              class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              :class="{ 'text-primary-600': $route.path === '/budget' }"
            >
              Presupuesto
            </router-link>
            <router-link 
              to="/summary" 
              class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              :class="{ 'text-primary-600': $route.path === '/summary' }"
            >
              Resumen
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <router-view />
    </main>
    <ConfirmDialog />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { Notivue, Notification } from 'notivue'
import ConfirmDialog from './components/ui/ConfirmDialog.vue'
import { useExpenseStore } from './stores/expenseStore'
import { ref } from 'vue'

const expenseStore = useExpenseStore()
const appTitle = ref(import.meta.env.VITE_APP_TITLE)
console.log(appTitle.value)
onMounted(async () => {

  await expenseStore.loadExpenses()
  await expenseStore.loadCategories()
  await expenseStore.loadBudget()
  await expenseStore.loadFixedExpenses()
})

</script>
