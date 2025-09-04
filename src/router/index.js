import { createRouter, createWebHistory } from 'vue-router'
import ExpensesList from '../views/ExpensesList.vue'
import BudgetView from '../views/BudgetView.vue'
import SummaryView from '../views/SummaryView.vue'

const routes = [
  {
    path: '/',
    name: 'ExpensesList',
    component: ExpensesList
  },
  {
    path: '/budget',
    name: 'BudgetView',
    component: BudgetView
  },
  {
    path: '/summary',
    name: 'SummaryView',
    component: SummaryView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
