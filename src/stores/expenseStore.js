import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import googleSheetsService from '../services/googleSheetsBackend.js'

export const useExpenseStore = defineStore('expense', () => {
  // State
  const expenses = ref([])
  const categories = ref([])
  const budget = ref({ amount: 0, month: '' })
  const fixedExpenses = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters computados
  const currentMonthExpenses = computed(() => {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    
    return expenses.value.filter(expense => {
      const expenseDate = new Date(expense.date)
      return isWithinInterval(expenseDate, { start: monthStart, end: monthEnd })
    })
  })

  const totalSpent = computed(() => {
    return currentMonthExpenses.value.reduce((sum, expense) => sum + expense.amount, 0)
  })

  const budgetProgress = computed(() => {
    if (budget.value.amount === 0) return 0
    return Math.min((totalSpent.value / budget.value.amount) * 100, 100)
  })

  const remainingBudget = computed(() => {
    return Math.max(budget.value.amount - totalSpent.value, 0)
  })

  const isOverBudget = computed(() => {
    return totalSpent.value > budget.value.amount
  })

  const activeCategories = computed(() => {
    return categories.value.filter(category => category.active)
  })

  const activeFixedExpenses = computed(() => {
    return fixedExpenses.value.filter(expense => expense.active)
  })

  const expensesByCategory = computed(() => {
    const categoryTotals = {}
    
    currentMonthExpenses.value.forEach(expense => {
      const categoryId = expense.categoryId
      if (!categoryTotals[categoryId]) {
        categoryTotals[categoryId] = {
          category: expense.category,
          amount: 0,
          count: 0
        }
      }
      categoryTotals[categoryId].amount += expense.amount
      categoryTotals[categoryId].count += 1
    })
    
    return Object.values(categoryTotals)
      .map(categoryData => ({
        ...categoryData,
        percentage: totalSpent.value > 0 ? (categoryData.amount / totalSpent.value) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)
  })

  // Nuevas propiedades computadas para gastos fijos del mes
  const fixedExpensesThisMonth = computed(() => {
    return currentMonthExpenses.value.filter(expense => expense.isFixed === true)
  })

  const totalFixedExpenses = computed(() => {
    return fixedExpensesThisMonth.value.reduce((total, expense) => total + expense.amount, 0)
  })

  // Actions
  const loadExpenses = async () => {
    loading.value = true
    error.value = null
    
    try {
      expenses.value = await googleSheetsService.getExpensesWithCategories()
    } catch (err) {
      error.value = 'Error al cargar los gastos'
      console.error('Error loading expenses:', err)
    } finally {
      loading.value = false
    }
  }

  const loadCategories = async () => {
    try {
      categories.value = await googleSheetsService.getCategories()
    } catch (err) {
      error.value = 'Error al cargar las categorías'
      console.error('Error loading categories:', err)
    }
  }

  const loadBudget = async () => {
    try {
      budget.value = await googleSheetsService.getBudget()
    } catch (err) {
      error.value = 'Error al cargar el presupuesto'
      console.error('Error loading budget:', err)
    }
  }

  const loadFixedExpenses = async () => {
    try {
      fixedExpenses.value = await googleSheetsService.getFixedExpenses()
    } catch (err) {
      error.value = 'Error al cargar los gastos fijos'
      console.error('Error loading fixed expenses:', err)
    }
  }

  const addExpense = async (expenseData) => {
    loading.value = true
    error.value = null
    
    try {
      const newExpense = {
        id: Date.now().toString(),
        date: expenseData.date || format(new Date(), 'yyyy-MM-dd'),
        description: expenseData.description,
        amount: parseFloat(expenseData.amount),
        categoryId: parseInt(expenseData.categoryId),
        isFixed: expenseData.isFixed || false,
        fixedExpenseId: null // Se asignará después si es fijo
      }

      await googleSheetsService.addExpense(newExpense)
      
             // Si es un gasto fijo, también lo agregamos a la lista de gastos fijos
       if (expenseData.isFixed && expenseData.dayOfMonth) {
         // Verificar si ya existe un gasto fijo similar
         const exists = await googleSheetsService.checkFixedExpenseExists(
           expenseData.description, 
           parseInt(expenseData.categoryId)
         )
         
         if (!exists) {
           const newFixedExpense = {
             id: Date.now().toString(),  // Generar ID como string
             name: expenseData.description,
             amount: parseFloat(expenseData.amount),
             categoryId: parseInt(expenseData.categoryId),
             dayOfMonth: parseInt(expenseData.dayOfMonth),
             active: true
           }

           await googleSheetsService.addFixedExpense(newFixedExpense)
           fixedExpenses.value.push(newFixedExpense)
           
           // Actualizar el gasto con el ID del gasto fijo
           newExpense.fixedExpenseId = newFixedExpense.id
           
           // Actualizar el gasto en Google Sheets con el fixedExpenseId
           await googleSheetsService.updateExpense(newExpense)
         }
       }
      
      // Recargar gastos para obtener la información completa de categorías
      await loadExpenses()
      
      return newExpense
    } catch (err) {
      error.value = 'Error al agregar el gasto'
      console.error('Error adding expense:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateBudget = async (newBudget) => {
    loading.value = true
    error.value = null
    
    try {
      const budgetData = {
        month: newBudget.month || format(new Date(), 'yyyy-MM'),
        amount: parseFloat(newBudget.amount)
      }

      await googleSheetsService.updateBudget(budgetData)
      budget.value = budgetData
      
      return budgetData
    } catch (err) {
      error.value = 'Error al actualizar el presupuesto'
      console.error('Error updating budget:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const addCategory = async (categoryData) => {
    try {
             const newCategory = {
         id: Date.now().toString(),  // Generar ID como string
         name: categoryData.name,
         color: categoryData.color || '#3B82F6',
         active: true
       }

      await googleSheetsService.addCategory(newCategory)
      categories.value.push(newCategory)
      
      return newCategory
    } catch (err) {
      error.value = 'Error al agregar la categoría'
      console.error('Error adding category:', err)
      throw err
    }
  }

  const updateCategory = async (categoryData) => {
    try {
      await googleSheetsService.updateCategory(categoryData)
      
      const index = categories.value.findIndex(c => c.id === categoryData.id)
      if (index !== -1) {
        categories.value[index] = categoryData
      }
      
      return categoryData
    } catch (err) {
      error.value = 'Error al actualizar la categoría'
      console.error('Error updating category:', err)
      throw err
    }
  }

  const addFixedExpense = async (fixedExpenseData) => {
    loading.value = true
    error.value = null
    
    try {
      const newFixedExpense = {
        id: Math.max(...fixedExpenses.value.map(f => f.id), 0) + 1,
        name: fixedExpenseData.name,
        amount: parseFloat(fixedExpenseData.amount),
        categoryId: parseInt(fixedExpenseData.categoryId),
        dayOfMonth: parseInt(fixedExpenseData.dayOfMonth),
        active: true
      }

      await googleSheetsService.addFixedExpense(newFixedExpense)
      fixedExpenses.value.push(newFixedExpense)
      
      return newFixedExpense
    } catch (err) {
      error.value = 'Error al agregar el gasto fijo'
      console.error('Error adding fixed expense:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateFixedExpense = async (fixedExpenseData) => {
    loading.value = true
    error.value = null
    
    try {
      await googleSheetsService.updateFixedExpense(fixedExpenseData)
      
      const index = fixedExpenses.value.findIndex(f => f.id === fixedExpenseData.id)
      if (index !== -1) {
        fixedExpenses.value[index] = fixedExpenseData
      }
      
      return fixedExpenseData
    } catch (err) {
      error.value = 'Error al actualizar el gasto fijo'
      console.error('Error updating fixed expense:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const generateFixedExpensesForMonth = async (month) => {
    loading.value = true
    error.value = null
    
    try {
      const generatedExpenses = await googleSheetsService.generateFixedExpensesForMonth(month)
      
      // Agregar los gastos generados a la lista de gastos
      for (const expense of generatedExpenses) {
        await googleSheetsService.addExpense(expense)
      }
      
      // Recargar gastos
      await loadExpenses()
      
      return generatedExpenses
    } catch (err) {
      error.value = 'Error al generar gastos fijos'
      console.error('Error generating fixed expenses:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    expenses,
    categories,
    budget,
    fixedExpenses,
    loading,
    error,
    
    // Getters
    currentMonthExpenses,
    totalSpent,
    budgetProgress,
    remainingBudget,
    isOverBudget,
    activeCategories,
    activeFixedExpenses,
    expensesByCategory,
    fixedExpensesThisMonth,
    totalFixedExpenses,
    
    // Actions
    loadExpenses,
    loadCategories,
    loadBudget,
    loadFixedExpenses,
    addExpense,
    updateBudget,
    addCategory,
    updateCategory,
    addFixedExpense,
    updateFixedExpense,
    generateFixedExpensesForMonth,
    clearError
  }
})
