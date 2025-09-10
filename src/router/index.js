import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'ExpensesList',
    component: () => import('../views/ExpensesList.vue'),
    meta: {
      title: 'Gastos - Cash Flow Tracker'
    }
  },
  {
    path: '/budget',
    name: 'BudgetView',
    component: () => import('../views/BudgetView.vue'),
    meta: {
      title: 'Presupuesto - Cash Flow Tracker'
    }
  },
  {
    path: '/summary',
    name: 'SummaryView',
    component: () => import('../views/SummaryView.vue'),
    meta: {
      title: 'Resumen - Cash Flow Tracker'
    }
  },
  {
    path: '/debts',
    name: 'DebtsView',
    component: () => import('../views/DebtsView.vue'),
    meta: {
      title: 'Créditos - Cash Flow Tracker'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Actualizar título de la página basado en la ruta
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }
  next()
})

export default router
