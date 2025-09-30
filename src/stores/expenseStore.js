import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { parseLocalDate } from '../utils/date.js'
import googleSheetsService from '../services/googleSheetsBackend.js'
import { useDebtStore } from './debtStore.js'

export const useExpenseStore = defineStore('expense', () => {
  // State
  const expenses = ref([])
  const categories = ref([])
  const budget = ref({ amount: 0, month: '' })
  const budgetsByMonth = ref({})
  const fixedExpenses = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters computados
  const currentMonthExpenses = computed(() => {
    const now = new Date()
    const currentMonthStr = format(now, 'yyyy-MM')
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    
    return (expenses.value || []).filter(expense => {
      const rawDate = expense?.date
      // Camino rápido y robusto: comparar prefijo cuando la fecha es 'yyyy-MM-...'
      if (typeof rawDate === 'string' && /^\d{4}-\d{2}/.test(rawDate)) {
        return rawDate.slice(0, 7) === currentMonthStr
      }
      // Fallback: parseo local y verificación por intervalo
      const expenseDate = parseLocalDate(rawDate)
      const time = expenseDate?.getTime?.()
      if (Number.isNaN(time)) return false
      return isWithinInterval(expenseDate, { start: monthStart, end: monthEnd })
    })
  })

  // Total gastado del mes que impacta el presupuesto:
  // - Incluye gastos normales (sin debtId)
  // - Incluye pagos de crédito (payment) que no estén 'pending'
  // - Excluye cargos de crédito (charge)
  const totalSpent = computed(() => {
    return currentMonthExpenses.value
      .filter(expense => {
        const isCredit = !!expense?.debtId
        if (!isCredit) return true
        const type = String(expense?.entryType || '').toLowerCase()
        const status = String(expense?.status || '').toLowerCase()
        if (type === 'payment') {
          return status !== 'pending'
        }
        return false
      })
      .reduce((sum, expense) => sum + expense.amount, 0)
  })

  const budgetProgress = computed(() => {
    if (budget.value.amount === 0) return 0
    return Math.min((totalSpent.value / budget.value.amount) * 100, 100)
  })

  const remainingBudget = computed(() => {
    return Math.max(budget.value.amount - totalSpent.value, 0)
  })

  const isOverBudget = computed(() => {
    return budget.value.amount > 0 && totalSpent.value > budget.value.amount
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

  // Nuevas propiedades computadas para gráficos
  const averageDailyExpense = computed(() => {
    if (currentMonthExpenses.value.length === 0) return 0
    const now = new Date()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    return totalSpent.value / daysInMonth
  })

  const dailyExpensesData = computed(() => {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    const daysInMonth = monthEnd.getDate()
    
    // Crear array con todos los días del mes
    const dailyData = []
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(now.getFullYear(), now.getMonth(), day)
      const dateStr = format(date, 'yyyy-MM-dd')
      
      // Calcular gastos para este día
      const dayExpenses = expenses.value.filter(expense => {
        const expenseDate = parseLocalDate(expense.date)
        return format(expenseDate, 'yyyy-MM-dd') === dateStr
      })
      
      const dayTotal = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0)
      
      dailyData.push({
        date: dateStr,
        amount: dayTotal
      })
    }
    
    return dailyData
  })

  const monthlyTrendsData = computed(() => {
    const trends = []
    const now = new Date()
    
    // Obtener datos de los últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStr = format(monthDate, 'yyyy-MM')
      const monthStart = startOfMonth(monthDate)
      const monthEnd = endOfMonth(monthDate)
      
      // Calcular gastos del mes
      const monthExpenses = expenses.value.filter(expense => {
        const expenseDate = parseLocalDate(expense.date)
        return isWithinInterval(expenseDate, { start: monthStart, end: monthEnd })
      })
      
      const monthTotal = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
      const monthBudget = budgetsByMonth.value[monthStr] || 0
      
      trends.push({
        month: monthStr,
        expenses: monthTotal,
        budget: monthBudget
      })
    }
    
    return trends
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
      const b = await googleSheetsService.getBudget()
      // Asegurar que sea para el mes actual; si no, normalizar
      const currentMonth = format(new Date(), 'yyyy-MM')
      if (!b || typeof b !== 'object') {
        budget.value = { amount: 0, month: currentMonth }
      } else {
        budget.value = {
          month: typeof b.month === 'string' ? b.month : currentMonth,
          amount: parseFloat(b.amount) || 0
        }
        // Si vino de otro mes, ajustar a mes actual pero mantener amount
        if (budget.value.month !== currentMonth) {
          budget.value = { month: currentMonth, amount: budget.value.amount }
        }
      }
    } catch (err) {
      error.value = 'Error al cargar el presupuesto'
      console.error('Error loading budget:', err)
    }
  }

  const loadBudgets = async () => {
    try {
      budgetsByMonth.value = await googleSheetsService.getBudgets()
    } catch (err) {
      console.error('Error loading budgets:', err)
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
      // Validación mínima basada en debtId (ya no usamos categoría 7 para marcar crédito)
      if (expenseData.debtId) {
        const entryType = expenseData.entryType && String(expenseData.entryType).toLowerCase()
        if (!entryType || (entryType !== 'charge' && entryType !== 'payment')) {
          throw new Error('Para gastos de crédito debes indicar el tipo: cargo o pago')
        }
      }

      const newExpensePayload = {
        date: expenseData.date || format(new Date(), 'yyyy-MM-dd'),
        description: expenseData.description,
        amount: parseFloat(expenseData.amount),
        categoryId: parseInt(expenseData.categoryId),
        isFixed: expenseData.isFixed || false,
        fixedExpenseId: expenseData.fixedExpenseId || null,
        entryType: expenseData.debtId ? (expenseData.entryType ? String(expenseData.entryType).toLowerCase() : undefined) : undefined,
        status: expenseData.status ? String(expenseData.status).toLowerCase() : undefined,
        debtId: expenseData.debtId ?? null
      }

      const created = await googleSheetsService.addExpense(newExpensePayload)
      const createdId = created?.data?.id || created?.id
      
      // Si es un gasto fijo y no tiene fixedExpenseId, crear el gasto fijo directamente (sin check)
      if (expenseData.isFixed && expenseData.dayOfMonth && !expenseData.fixedExpenseId) {
        const newFixedExpense = {
          id: Date.now().toString(),
          name: expenseData.description,
          amount: parseFloat(expenseData.amount),
          categoryId: parseInt(expenseData.categoryId),
          dayOfMonth: parseInt(expenseData.dayOfMonth),
          active: true
        }

        await googleSheetsService.addFixedExpense(newFixedExpense)
        fixedExpenses.value.push(newFixedExpense)

        // Actualizar el gasto con el ID del gasto fijo (usar id devuelto por la API)
        if (createdId) {
          await googleSheetsService.updateExpense(createdId, { fixedExpenseId: newFixedExpense.id })
        }
      }
      
      // Recargar gastos para obtener la información completa de categorías
      await loadExpenses()
      // Si afecta a créditos (debtId), refrescar deudas para reflejar side-effects de balance
      try {
        if (newExpensePayload.debtId) {
          const debtStore = useDebtStore()
          await debtStore.loadDebts()
        }
      } catch (e) {
        console.warn('No se pudo refrescar deudas tras agregar gasto:', e)
      }
      
      return {
        id: createdId || expenseData.id || Date.now().toString(),
        ...newExpensePayload
      }
    } catch (err) {
      error.value = 'Error al agregar el gasto'
      console.error('Error adding expense:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Agregar múltiples gastos en lote (mejor rendimiento)
  const addExpensesBatch = async (expensesData) => {
    loading.value = true
    error.value = null
    
    try {
      const expenses = expensesData.map(expenseData => ({
        date: expenseData.date || format(new Date(), 'yyyy-MM-dd'),
        description: expenseData.description,
        amount: parseFloat(expenseData.amount),
        categoryId: parseInt(expenseData.categoryId),
        isFixed: expenseData.isFixed || false,
        fixedExpenseId: expenseData.fixedExpenseId || null,
        entryType: expenseData.debtId ? (expenseData.entryType ? String(expenseData.entryType).toLowerCase() : undefined) : undefined,
        status: expenseData.status ? String(expenseData.status).toLowerCase() : undefined,
        debtId: expenseData.debtId ?? null
      }))

      const result = await googleSheetsService.addExpensesBatch(expenses)
      
      // Recargar gastos para obtener la información completa de categorías
      await loadExpenses()
      // Refrescar deudas si hay algún gasto de crédito (con debtId)
      try {
        if (expenses.some(e => !!e.debtId)) {
          const debtStore = useDebtStore()
          await debtStore.loadDebts()
        }
      } catch (e) {
        console.warn('No se pudo refrescar deudas tras agregar gastos en lote:', e)
      }
      
      return result
    } catch (err) {
      error.value = 'Error al agregar los gastos'
      console.error('Error adding expenses batch:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateExpense = async (expenseData) => {
    loading.value = true
    error.value = null

    try {
      const id = expenseData.id
      const payload = {
        date: expenseData.date,
        description: expenseData.description,
        amount: parseFloat(expenseData.amount),
        categoryId: parseInt(expenseData.categoryId),
        isFixed: !!expenseData.isFixed,
        entryType: expenseData.debtId ? (expenseData.entryType ? String(expenseData.entryType).toLowerCase() : undefined) : undefined,
        status: expenseData.status ? String(expenseData.status).toLowerCase() : undefined,
        debtId: expenseData.debtId ?? null
      }

      // Preservar fixedExpenseId si no viene en la edición para evitar perder el enlace
      if ('fixedExpenseId' in expenseData) {
        payload.fixedExpenseId = expenseData.fixedExpenseId ?? null
      }

      await googleSheetsService.updateExpense(id, payload)

      // Refrescar lista para mantener categorías embebidas correctas
      await loadExpenses()
      // Refrescar deudas si este gasto pertenece a créditos (tiene debtId)
      try {
        if (payload.debtId) {
          const debtStore = useDebtStore()
          await debtStore.loadDebts()
        }
      } catch (e) {
        console.warn('No se pudo refrescar deudas tras actualizar gasto:', e)
      }
      return { id, ...payload }
    } catch (err) {
      error.value = 'Error al actualizar el gasto'
      console.error('Error updating expense:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteExpense = async (id) => {
    loading.value = true
    error.value = null
    try {
      // Capturar si el gasto pertenece a un crédito antes de eliminar
      const toDelete = expenses.value.find(e => String(e.id) === String(id))
      const hadDebtId = !!toDelete?.debtId

      await googleSheetsService.deleteExpense(id)
      // Optimista: remover localmente
      expenses.value = expenses.value.filter(e => String(e.id) !== String(id))

      // Refrescar deudas si el gasto eliminado afectaba un crédito
      try {
        if (hadDebtId) {
          const debtStore = useDebtStore()
          await debtStore.loadDebts()
        }
      } catch (e) {
        console.warn('No se pudo refrescar deudas tras eliminar gasto:', e)
      }
      return true
    } catch (err) {
      error.value = 'Error al eliminar el gasto'
      console.error('Error deleting expense:', err)
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
      // Re-cargar para asegurar que tomamos el del mes actual desde la lista completa
      await loadBudget()
      
      return budget.value
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
        id: Date.now().toString(),
        name: fixedExpenseData.name,
        amount: parseFloat(fixedExpenseData.amount),
        categoryId: parseInt(fixedExpenseData.categoryId),
        dayOfMonth: parseInt(fixedExpenseData.dayOfMonth),
        active: fixedExpenseData.active !== false
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
      const id = fixedExpenseData.id
      const payload = {
        name: fixedExpenseData.name,
        amount: parseFloat(fixedExpenseData.amount),
        categoryId: parseInt(fixedExpenseData.categoryId),
        dayOfMonth: parseInt(fixedExpenseData.dayOfMonth),
        active: fixedExpenseData.active !== false
      }
      await googleSheetsService.updateFixedExpense(id, payload)
      
      const index = fixedExpenses.value.findIndex(f => f.id === fixedExpenseData.id)
      if (index !== -1) {
        fixedExpenses.value[index] = { id, ...payload }
      }
      
      return { id, ...payload }
    } catch (err) {
      error.value = 'Error al actualizar el gasto fijo'
      console.error('Error updating fixed expense:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteFixedExpense = async (id) => {
    loading.value = true
    error.value = null
    try {
      await googleSheetsService.deleteFixedExpense(id)
      fixedExpenses.value = fixedExpenses.value.filter(f => String(f.id) !== String(id))
      return true
    } catch (err) {
      error.value = 'Error al eliminar el gasto fijo'
      console.error('Error deleting fixed expense:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const generateFixedExpensesForMonth = async (month) => {
    loading.value = true
    error.value = null
    
    try {
      console.log('Store: Generando gastos fijos para el mes:', month)
      
      // Intentar usar el endpoint batch primero, si falla usar el original
      let result
      try {
        result = await googleSheetsService.generateFixedExpensesForMonthBatch(month)
        console.log('Store: Resultado de la generación batch:', result)
      } catch (batchError) {
        console.warn('Store: Endpoint batch falló, usando endpoint original:', batchError)
        result = await googleSheetsService.generateFixedExpensesForMonth(month)
        console.log('Store: Resultado de la generación original:', result)
      }
      
      // Recargar gastos para reflejar lo generado por el backend
      await loadExpenses()
      
      return result
    } catch (err) {
      error.value = 'Error al generar gastos fijos'
      console.error('Error generating fixed expenses:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Generar gastos fijos localmente excluyendo categoría 7 (Créditos)
  const generateFixedExpensesForMonthLocal = async (month) => {
    loading.value = true
    error.value = null
    try {
      if (typeof month !== 'string' || month.length !== 7) {
        throw new Error('Mes inválido. Formato esperado: yyyy-MM')
      }

      const [yearStr, monthStr] = month.split('-')
      const year = parseInt(yearStr)
      const monthIndex = parseInt(monthStr) - 1
      if (isNaN(year) || isNaN(monthIndex)) {
        throw new Error('Mes inválido. Formato esperado: yyyy-MM')
      }

      // Preparar gastos a crear, excluyendo categoría 7
      const toCreate = []
      const lastDay = new Date(year, monthIndex + 1, 0).getDate()

      const activeFixed = (fixedExpenses.value || []).filter(f => f && f.active !== false)

      for (const f of activeFixed) {
        const categoryId = parseInt(f.categoryId)
        if (categoryId === 7) {
          // Excluir créditos
          continue
        }

        const day = Math.min(Math.max(parseInt(f.dayOfMonth) || 1, 1), lastDay)
        const date = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

        // Evitar duplicados: si ya existe un gasto con este fixedExpenseId en el mes
        const exists = (expenses.value || []).some(e => {
          return e && e.isFixed === true && String(e.fixedExpenseId) === String(f.id) && typeof e.date === 'string' && e.date.slice(0, 7) === month
        })
        if (exists) continue

        toCreate.push({
          id: Date.now().toString() + Math.random().toString(36).slice(2),
          date,
          description: f.name,
          amount: Number(f.amount) || 0,
          categoryId: categoryId,
          isFixed: true,
          fixedExpenseId: String(f.id)
        })
      }

      if (toCreate.length === 0) {
        return { success: true, created: 0 }
      }

      const result = await googleSheetsService.addExpensesBatch(toCreate)
      await loadExpenses()
      return result
    } catch (err) {
      error.value = 'Error al generar gastos fijos'
      console.error('Error generating fixed expenses locally:', err)
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
    budgetsByMonth,
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
    averageDailyExpense,
    dailyExpensesData,
    monthlyTrendsData,
    
    // Actions
    loadExpenses,
    loadCategories,
    loadBudget,
    loadBudgets,
    loadFixedExpenses,
    addExpense,
    addExpensesBatch,
    updateExpense,
    deleteExpense,
    updateBudget,
    addCategory,
    updateCategory,
    addFixedExpense,
    updateFixedExpense,
    deleteFixedExpense,
    generateFixedExpensesForMonth,
    generateFixedExpensesForMonthLocal,
    clearError
  }
})
