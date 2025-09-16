// Google Sheets API service usando backend
// Este servicio se comunica con el servidor backend que maneja la autenticación

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

class GoogleSheetsBackendService {
  constructor() {
    this.baseUrl = API_BASE_URL
  }


  // Hacer request al backend
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers
        }
      })

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`
        
        try {
          const errorData = await response.json()
          errorMessage = errorData?.message || errorData?.error || errorMessage
        } catch {
          // Si no se puede parsear como JSON, usar el texto plano
          const errorText = await response.text()
          if (errorText) {
            errorMessage = errorText
          }
        }
        
        throw new Error(errorMessage)
      }

      // Respuesta exitosa
      if (response.status === 204) return {}
      
      try {
        return await response.json()
      } catch (parseError) {
        console.warn('Failed to parse response as JSON:', parseError)
        return {}
      }
    } catch (error) {
      // Mejorar mensajes de error para el usuario
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.')
      }
      
      console.error('Error making request to backend:', error)
      throw error
    }
  }

  // ==========================
  // Deudas (Debts) API
  // ==========================
  /**
   * Obtiene todas las deudas desde el backend
   * @returns {Array} - Array de objetos de deuda
   */
  async getDebts() {
    try {
      const response = await this.makeRequest('/debts')
      const items = Array.isArray(response?.data)
        ? response.data
        : (Array.isArray(response) ? response : [])

      return items.map(item => this.parseDebtRow(item))
    } catch (error) {
      console.error('Error fetching debts:', error)
      return []
    }
  }

  /**
   * Parsea una fila de datos de deuda
   * @param {Array} row - Fila de datos del backend
   * @returns {Object} - Objeto de deuda parseado
   */
  parseDebtRow(item) {
    const toNumberOrNull = (v) => (v === null || v === undefined || v === '' ? null : Number(v))
    const toIntOrNull = (v) => (v === null || v === undefined || v === '' ? null : parseInt(v))
    return {
      id: String(item?.id || ''),
      name: item?.name || '',
      issuer: item?.issuer || '',
      creditLimit: toNumberOrNull(item?.creditLimit),
      balance: toNumberOrNull(item?.balance),
      dueDay: toIntOrNull(item?.dueDay),
      cutOffDay: toIntOrNull(item?.cutOffDay),
      maskPan: item?.maskPan ?? null,
      interesEfectivo: toNumberOrNull(item?.interesEfectivo),
      brand: item?.brand ?? null,
      active: item?.active === false ? false : true
    }
  }

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

  async createDebt(payload) {
    try {
      const response = await this.makeRequest('/debts', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      return response?.data || response
    } catch (error) {
      console.error('Error creating debt:', error)
      throw error
    }
  }

  async updateDebt(id, payload) {
    try {
      const response = await this.makeRequest(`/debts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
      return response?.data || response
    } catch (error) {
      console.error('Error updating debt:', error)
      throw error
    }
  }

  async deleteDebt(id) {
    try {
      const response = await this.makeRequest(`/debts/${id}`, {
        method: 'DELETE'
      })
      return response
    } catch (error) {
      console.error('Error deleting debt:', error)
      throw error
    }
  }

  async getDebtSummary(id) {
    try {
      const response = await this.makeRequest(`/debts/${id}/summary`)
      return response?.data || response
    } catch (error) {
      console.error('Error fetching debt summary:', error)
      return null
    }
  }

  async getAllDebtsSummary() {
    try {
      const response = await this.makeRequest('/debts/summary')
      return Array.isArray(response?.data) ? response.data : []
    } catch (error) {
      console.error('Error fetching debts summary:', error)
      return []
    }
  }

  /**
   * Obtiene el plan de cuotas para una deuda específica
   * @param {string} id - ID de la deuda
   * @param {Object} options - Opciones de consulta
   * @param {number} options.months - Número de meses
   * @param {string} options.start - Fecha de inicio
   * @returns {Object|null} - Datos del plan de cuotas
   */
  async getDebtInstallments(id, { months, start } = {}) {
    try {
      const params = new URLSearchParams()
      if (months != null) params.set('months', String(months))
      if (start) params.set('start', start)
      
      const response = await this.makeRequest(`/debts/${id}/installments?${params.toString()}`)
      return response?.data || response
    } catch (error) {
      console.error('Error fetching debt installments:', error)
      return null
    }
  }

  // Obtener categorías
  async getCategories() {
    try {
      const response = await this.makeRequest('/categories')
      const items = Array.isArray(response?.data)
        ? response.data
        : (Array.isArray(response) ? response : [])

      // Mapear a Category con valores por defecto para campos usados en UI
      return items.map(it => ({
        id: parseInt(it?.id) || 0,
        name: it?.name || '',
        type: it?.type ?? null,
        parentId: it?.parentId ?? null,
        // Campos legacy usados por UI
        color: it?.color || '#6B7280',
        active: true
      }))
    } catch (error) {
      console.error('Error fetching categories:', error)
      return []
    }
  }

  // Obtener gastos
  async getExpenses() {
    try {
      const response = await this.makeRequest('/expenses')
      const items = Array.isArray(response?.data)
        ? response.data
        : (Array.isArray(response) ? response : [])

      return items.map(it => ({
        id: String(it?.id || ''),
        date: it?.date || new Date().toISOString().slice(0,10),
        description: it?.description || '',
        amount: Number(it?.amount) || 0,
        categoryId: parseInt(it?.categoryId) || 0,
        isFixed: !!it?.isFixed,
        fixedExpenseId: it?.fixedExpenseId ?? null
      }))
    } catch (error) {
      console.error('Error fetching expenses:', error)
      return []
    }
  }

  // Obtener gastos con información de categorías
  async getExpensesWithCategories() {
    try {
      const [expenses, categories] = await Promise.all([
        this.getExpenses(),
        this.getCategories()
      ])
      
      // Crear mapa de categorías para lookup rápido
      const categoryMap = categories.reduce((map, category) => {
        map[category.id] = category
        return map
      }, {})
      
      // Combinar gastos con información de categorías
      const expensesWithCategories = expenses.map(expense => ({
        ...expense,
        category: categoryMap[expense.categoryId] || {
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
  async addExpense(expense) {
    try {
      const response = await this.makeRequest('/expenses', {
        method: 'POST',
        body: JSON.stringify(expense)
      })

      return response
    } catch (error) {
      console.error('Error adding expense:', error)
      throw error
    }
  }

  // Agregar múltiples gastos en lote (mejor rendimiento)
  async addExpensesBatch(expenses) {
    try {
      const response = await this.makeRequest('/expenses/batch', {
        method: 'POST',
        body: JSON.stringify({ expenses })
      })

      return response
    } catch (error) {
      console.error('Error adding expenses batch:', error)
      throw error
    }
  }

  // Actualizar gasto existente
  async updateExpense(id, data) {
    try {
      const idForBody = isNaN(Number(id)) ? id : Number(id)
      const response = await this.makeRequest(`/expenses/${id}`, {
        method: 'PUT',
        body: JSON.stringify({...data })
      })

      return response
    } catch (error) {
      console.error('Error updating expense:', error)
      throw error
    }
  }

  // Eliminar gasto
  async deleteExpense(id) {
    try {
      const response = await this.makeRequest(`/expenses/${id}`, {
        method: 'DELETE'
      })
      return response
    } catch (error) {
      console.error('Error deleting expense:', error)
      throw error
    }
  }

  // Obtener presupuesto mensual
  async getBudget() {
    try {
      const response = await this.makeRequest('/budget')
      const currentMonth = new Date().toISOString().slice(0, 7)
      const items = Array.isArray(response?.data)
        ? response.data
        : (Array.isArray(response) ? response : [])

      const budgets = items.map(it => ({ month: String(it?.month || ''), amount: Number(it?.amount) || 0 }))
      const match = budgets.find(b => b.month === currentMonth)
      if (match) return match
      return { month: currentMonth, amount: 0 }
    } catch (error) {
      console.error('Error fetching budget:', error)
      return { amount: 0, month: new Date().toISOString().slice(0, 7) }
    }
  }

  // Obtener todos los presupuestos en mapa { 'yyyy-MM': amount }
  async getBudgets() {
    try {
      const response = await this.makeRequest('/budget')
      const items = Array.isArray(response?.data)
        ? response.data
        : (Array.isArray(response) ? response : [])
      const map = {}
      for (const it of items) {
        const month = String(it?.month || '')
        const amount = Number(it?.amount) || 0
        if (month) map[month] = amount
      }
      return map
    } catch (error) {
      console.error('Error fetching budgets:', error)
      return {}
    }
  }

  // Actualizar presupuesto mensual
  async updateBudget(budget) {
    try {
      const response = await this.makeRequest('/budget', {
        method: 'PUT',
        body: JSON.stringify(budget)
      })

      return response
    } catch (error) {
      console.error('Error updating budget:', error)
      throw error
    }
  }

  // Agregar nueva categoría
  async addCategory(category) {
    try {
      return category
    } catch (error) {
      console.error('Error adding category:', error)
      throw error
    }
  }

  // Actualizar categoría
  async updateCategory(category) {
    try {
      return category
    } catch (error) {
      console.error('Error updating category:', error)
      throw error
    }
  }

  // Probar conexión con el backend
  async testConnection() {
    try {
      const response = await this.makeRequest('/test')
      return response
    } catch (error) {
      console.error('Error testing backend connection:', error)
      throw error
    }
  }

  // Obtener gastos fijos
  async getFixedExpenses() {
    try {
      const response = await this.makeRequest('/fixed-expenses')
      const items = Array.isArray(response?.data)
        ? response.data
        : (Array.isArray(response) ? response : [])
      const fixedExpenses = items.map(it => ({
        id: String(it?.id || ''),
        name: it?.name || '',
        amount: Number(it?.amount) || 0,
        categoryId: parseInt(it?.categoryId) || 0,
        dayOfMonth: parseInt(it?.dayOfMonth) || 1,
        active: it?.active !== false
      })).filter(expense => expense.active)
      return fixedExpenses
    } catch (error) {
      console.error('Error fetching fixed expenses:', error)
      return []
    }
  }

  // Agregar gasto fijo
  async addFixedExpense(fixedExpense) {
    try {
      const response = await this.makeRequest('/fixed-expenses', {
        method: 'POST',
        body: JSON.stringify(fixedExpense)
      })

      return response
    } catch (error) {
      console.error('Error adding fixed expense:', error)
      throw error
    }
  }

  // Actualizar gasto fijo
  async updateFixedExpense(id, data) {
    try {
      const response = await this.makeRequest(`/fixed-expenses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })

      return response
    } catch (error) {
      console.error('Error updating fixed expense:', error)
      throw error
    }
  }

  // Eliminar gasto fijo
  async deleteFixedExpense(id) {
    try {
      const response = await this.makeRequest(`/fixed-expenses/${id}`, {
        method: 'DELETE'
      })
      return response
    } catch (error) {
      console.error('Error deleting fixed expense:', error)
      throw error
    }
  }

  // Generar gastos fijos para el mes actual
  async generateFixedExpensesForMonth(month) {
    try {
      const response = await this.makeRequest('/generate-fixed-expenses', {
        method: 'POST',
        body: JSON.stringify({ month })
      })

      return response
    } catch (error) {
      console.error('Error generating fixed expenses:', error)
      throw error
    }
  }

  // Generar gastos fijos usando endpoint batch (mejor rendimiento)
  async generateFixedExpensesForMonthBatch(month) {
    try {
      console.log('Service: Enviando request para generar gastos fijos del mes:', month)
      const response = await this.makeRequest('/generate-fixed-expenses/batch', {
        method: 'POST',
        body: JSON.stringify({ month })
      })
      console.log('Service: Respuesta del backend:', response)

      return response
    } catch (error) {
      console.error('Error generating fixed expenses batch:', error)
      throw error
    }
  }

  // Verificar si ya existe un gasto fijo
  async checkFixedExpenseExists(description, categoryId) {
    try {
      const response = await this.makeRequest('/check-fixed-expense', {
        method: 'POST',
        body: JSON.stringify({ description, categoryId })
      })

      return response.exists
    } catch (error) {
      console.error('Error checking fixed expense existence:', error)
      return false
    }
  }
}

export default new GoogleSheetsBackendService()
