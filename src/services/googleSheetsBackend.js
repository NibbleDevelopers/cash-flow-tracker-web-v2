// Fachada para mantener compatibilidad mientras migramos a módulos por dominio
import * as DebtsAPI from './api/debts'
import * as ExpensesAPI from './api/expenses'
import * as CategoriesAPI from './api/categories'
import * as BudgetAPI from './api/budget'
import * as FixedAPI from './api/fixedExpenses'

class GoogleSheetsBackendService {
  constructor() {
    this._categoriesCache = null
  }

  // ==========================
  // Deudas (Debts) API
  // ==========================
  /**
   * Obtiene todas las deudas desde el backend
   * @returns {Array} - Array de objetos de deuda
   */
  async getDebts() { return DebtsAPI.getDebts() }

  /**
   * Parsea una fila de datos de deuda
   * @param {Array} row - Fila de datos del backend
   * @returns {Object} - Objeto de deuda parseado
   */
  parseDebtRow(item) { return item }

  /**
   * Parsea un valor de día, manejando casos especiales
   * @param {any} value - Valor a parsear
   * @returns {number|null} - Día parseado o null
   */
  parseDayValue(value) {
    if (value === undefined || value === '' || value === null) {
      return null
    }
    const parsed = parseInt(value)
    return isNaN(parsed) ? null : parsed
  }

  async createDebt(payload) { return DebtsAPI.createDebt(payload) }

  async updateDebt(id, payload) { return DebtsAPI.updateDebt(id, payload) }

  async deleteDebt(id) { return DebtsAPI.deleteDebt(id) }

  async getDebtSummary(id) { return DebtsAPI.getDebtSummary(id) }

  async getAllDebtsSummary() { return [] }

  /**
   * Obtiene el plan de cuotas para una deuda específica
   * @param {string} id - ID de la deuda
   * @param {Object} options - Opciones de consulta
   * @param {number} options.months - Número de meses
   * @param {string} options.start - Fecha de inicio
   * @returns {Object|null} - Datos del plan de cuotas
   */
  async getDebtInstallments(id, opts) { return DebtsAPI.getDebtInstallments(id, opts) }

  // Obtener categorías
  async getCategories() {
    if (Array.isArray(this._categoriesCache) && this._categoriesCache.length > 0) {
      return this._categoriesCache
    }
    const cats = await CategoriesAPI.getCategories()
    this._categoriesCache = cats
    return cats
  }

  // Obtener gastos
  async getExpenses() { return ExpensesAPI.getExpenses() }

  // Obtener gastos con información de categorías
  async getExpensesWithCategories() {
    try {
      const [expenses, categories] = await Promise.all([
        this.getExpenses(),
        this.getCategories()
      ])
      
      // Crear mapa de categorías para lookup rápido
      const categoryMap = categories.reduce((map, category) => {
        map[String(category.id)] = category
        return map
      }, {})
      
      // Combinar gastos con información de categorías
      const expensesWithCategories = expenses.map(expense => ({
        ...expense,
        category: categoryMap[String(expense.categoryId)] || {
          id: expense.categoryId,
          name: 'Categoría no encontrada',
          color: '#6B7280',
          active: false
        }
      }))
      
      return expensesWithCategories
    } catch (error) {
      console.error('Error fetching expenses with categories:', error)
      return []
    }
  }

  // Agregar nuevo gasto
  async addExpense(expense) { return ExpensesAPI.addExpense(expense) }

  // Agregar múltiples gastos en lote (mejor rendimiento)
  async addExpensesBatch(expenses) { return ExpensesAPI.addExpensesBatch(expenses) }

  // Actualizar gasto existente
  async updateExpense(id, data) { return ExpensesAPI.updateExpense(id, data) }

  // Eliminar gasto
  async deleteExpense(id) { return ExpensesAPI.deleteExpense(id) }

  // Obtener presupuesto mensual
  async getBudget() { return BudgetAPI.getBudget() }

  // Obtener todos los presupuestos en mapa { 'yyyy-MM': amount }
  async getBudgets() { return BudgetAPI.getBudgets() }

  // Actualizar presupuesto mensual
  async updateBudget(budget) { return BudgetAPI.updateBudget(budget) }

  // Agregar nueva categoría
  async addCategory(category) {
    const res = await CategoriesAPI.addCategory(category)
    this._categoriesCache = null
    return res
  }

  // Actualizar categoría
  async updateCategory(category) {
    const res = await CategoriesAPI.updateCategory(category)
    this._categoriesCache = null
    return res
  }

  // Probar conexión con el backend
  async testConnection() { return makeRequest('/test') }

  // Obtener gastos fijos
  async getFixedExpenses() { return FixedAPI.getFixedExpenses() }

  // Agregar gasto fijo
  async addFixedExpense(fixedExpense) { return FixedAPI.addFixedExpense(fixedExpense) }

  // Actualizar gasto fijo
  async updateFixedExpense(id, data) { return FixedAPI.updateFixedExpense(id, data) }

  // Eliminar gasto fijo
  async deleteFixedExpense(id) { return FixedAPI.deleteFixedExpense(id) }

  // Generar gastos fijos para el mes actual
  async generateFixedExpensesForMonth(month) { return FixedAPI.generateFixedExpensesForMonth(month) }

  // Generar gastos fijos usando endpoint batch (mejor rendimiento)
  async generateFixedExpensesForMonthBatch(month) { return FixedAPI.generateFixedExpensesForMonthBatch(month) }

  // Verificar si ya existe un gasto fijo
  async checkFixedExpenseExists(description, categoryId) { return FixedAPI.checkFixedExpenseExists(description, categoryId) }
}

export default new GoogleSheetsBackendService()
