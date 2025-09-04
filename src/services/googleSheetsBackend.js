// Google Sheets API service usando backend
// Este servicio se comunica con el servidor backend que maneja la autenticación

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

class GoogleSheetsBackendService {
  constructor() {
    this.baseUrl = API_BASE_URL
  }

  // Hacer request al backend
  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}`
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error making request to backend:', error)
      throw error
    }
  }

  // Obtener categorías
  async getCategories() {
    try {
      const response = await this.makeRequest('/categories')
      
      // Verificar si la respuesta tiene la estructura esperada
      let values = []
      if (Array.isArray(response)) {
        values = response
      } else if (response && Array.isArray(response.values)) {
        values = response.values
      } else if (response && Array.isArray(response.data)) {
        values = response.data
      } else {
        console.warn('Unexpected categories response structure:', response)
        return []
      }
      
      // Convertir a objetos
      const categories = values.slice(1).map(row => ({
        id: parseInt(row[0]) || 0,
        name: row[1] || '',
        color: row[2] || '#6B7280',
        active: row[3] === 'TRUE'
      })).filter(category => category.active)
      
      return categories
    } catch (error) {
      console.error('Error fetching categories:', error)
      return []
    }
  }

  // Obtener gastos
  async getExpenses() {
    try {
      const response = await this.makeRequest('/expenses')
      
      // Verificar si la respuesta tiene la estructura esperada
      let values = []
      if (Array.isArray(response)) {
        values = response
      } else if (response && Array.isArray(response.values)) {
        values = response.values
      } else if (response && Array.isArray(response.data)) {
        values = response.data
      } else {
        console.warn('Unexpected response structure:', response)
        return []
      }
      
      // Convertir a objetos
      const expenses = values.slice(1).map(row => ({
        id: row[0] || Date.now().toString(),
        date: row[1] || new Date().toISOString().split('T')[0],
        description: row[2] || '',
        amount: parseFloat(row[3]) || 0,
        categoryId: parseInt(row[4]) || 0,
        isFixed: row[5] === 'TRUE',
        fixedExpenseId: row[6] || null
      }))
      
      return expenses
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

  // Actualizar gasto existente
  async updateExpense(expense) {
    try {
      const response = await this.makeRequest(`/expenses/${expense.id}`, {
        method: 'PUT',
        body: JSON.stringify(expense)
      })

      return response
    } catch (error) {
      console.error('Error updating expense:', error)
      throw error
    }
  }

  // Obtener presupuesto mensual
  async getBudget() {
    try {
      const response = await this.makeRequest('/budget')
      
      // Verificar si la respuesta tiene la estructura esperada
      let values = []
      if (Array.isArray(response)) {
        values = response
      } else if (response && Array.isArray(response.values)) {
        values = response.values
      } else if (response && Array.isArray(response.data)) {
        values = response.data
      } else {
        console.warn('Unexpected budget response structure:', response)
        return { amount: 0, month: new Date().toISOString().slice(0, 7) }
      }
      
      if (values.length > 1) {
        return {
          amount: parseFloat(values[1][1]) || 0,
          month: values[1][0] || new Date().toISOString().slice(0, 7)
        }
      }
      
      return { amount: 0, month: new Date().toISOString().slice(0, 7) }
    } catch (error) {
      console.error('Error fetching budget:', error)
      return { amount: 0, month: new Date().toISOString().slice(0, 7) }
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
      // Por ahora, solo agregamos la categoría localmente
      // En el futuro, podemos agregar un endpoint en el backend
      console.log('Adding category:', category)
      return category
    } catch (error) {
      console.error('Error adding category:', error)
      throw error
    }
  }

  // Actualizar categoría
  async updateCategory(category) {
    try {
      // Por ahora, solo actualizamos la categoría localmente
      // En el futuro, podemos agregar un endpoint en el backend
      console.log('Updating category:', category)
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
      
      // Verificar si la respuesta tiene la estructura esperada
      let values = []
      if (Array.isArray(response)) {
        values = response
      } else if (response && Array.isArray(response.values)) {
        values = response.values
      } else if (response && Array.isArray(response.data)) {
        values = response.data
      } else {
        console.warn('Unexpected fixed expenses response structure:', response)
        return []
      }
      
      // Convertir a objetos
      const fixedExpenses = values.slice(1).map(row => ({
        id: row[0] || '',  // Mantener como string para consistencia
        name: row[1] || '',
        amount: parseFloat(row[2]) || 0,
        categoryId: parseInt(row[3]) || 0,
        dayOfMonth: parseInt(row[4]) || 1,
        active: row[5] === 'TRUE'
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
  async updateFixedExpense(fixedExpense) {
    try {
      const response = await this.makeRequest('/fixed-expenses', {
        method: 'PUT',
        body: JSON.stringify(fixedExpense)
      })

      return response
    } catch (error) {
      console.error('Error updating fixed expense:', error)
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
