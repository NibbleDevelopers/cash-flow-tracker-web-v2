import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '../services/auth.js'

const routes = [
  // Rutas públicas
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: {
      title: 'Login - Cash Flow Tracker',
      requiresAuth: false
    }
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: () => import('../views/AuthCallbackView.vue'),
    meta: {
      title: 'Autenticando... - Cash Flow Tracker',
      requiresAuth: false
    }
  },
  
  // Rutas protegidas (requieren autenticación)
  {
    path: '/',
    name: 'ExpensesList',
    component: () => import('../views/ExpensesList.vue'),
    meta: {
      title: 'Gastos - Cash Flow Tracker',
      requiresAuth: true
    }
  },
  {
    path: '/budget',
    name: 'BudgetView',
    component: () => import('../views/BudgetView.vue'),
    meta: {
      title: 'Presupuesto - Cash Flow Tracker',
      requiresAuth: true
    }
  },
  {
    path: '/summary',
    name: 'SummaryView',
    component: () => import('../views/SummaryView.vue'),
    meta: {
      title: 'Resumen - Cash Flow Tracker',
      requiresAuth: true
    }
  },
  {
    path: '/debts',
    name: 'DebtsView',
    component: () => import('../views/DebtsView.vue'),
    meta: {
      title: 'Créditos - Cash Flow Tracker',
      requiresAuth: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard de navegación para proteger rutas
router.beforeEach((to, from, next) => {
  // Actualizar título de la página
  if (to.meta.title) {
    document.title = to.meta.title
  }

  // Verificar autenticación
  const requiresAuth = to.meta.requiresAuth !== false // Por defecto requiere auth
  const authenticated = isAuthenticated()

  if (requiresAuth && !authenticated) {
    // Ruta protegida y usuario no autenticado -> redirigir a login
    next('/login')
  } else if (!requiresAuth && authenticated && to.path === '/login') {
    // Usuario autenticado intentando acceder a login -> redirigir a home
    next('/')
  } else {
    // Permitir navegación
    next()
  }
})

export default router
