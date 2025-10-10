/**
 * Utilidades centralizadas para cálculos de gastos
 * Todas las funciones excluyen automáticamente los abonos (entryType === 'payment')
 * a menos que se especifique lo contrario
 */

/**
 * Verifica si un expense es un gasto real (no es un abono)
 * @param {Object} expense - El gasto a verificar
 * @returns {boolean}
 */
export const isActualExpense = (expense) => {
  return expense?.entryType !== 'payment'
}

/**
 * Filtra y devuelve solo los gastos reales (excluye abonos)
 * @param {Array} expenses - Array de gastos
 * @returns {Array} - Array filtrado sin abonos
 */
export const getActualExpenses = (expenses) => {
  if (!Array.isArray(expenses)) return []
  return expenses.filter(isActualExpense)
}

/**
 * Calcula el total de gastos reales (sin abonos)
 * @param {Array} expenses - Array de gastos
 * @returns {number} - Total de gastos
 */
export const calculateExpensesTotal = (expenses) => {
  if (!Array.isArray(expenses)) return 0
  return getActualExpenses(expenses).reduce((sum, expense) => sum + (expense.amount || 0), 0)
}

/**
 * Cuenta la cantidad de gastos reales (sin abonos)
 * @param {Array} expenses - Array de gastos
 * @returns {number} - Cantidad de gastos
 */
export const countActualExpenses = (expenses) => {
  if (!Array.isArray(expenses)) return 0
  return getActualExpenses(expenses).length
}

/**
 * Filtra gastos por un período de fechas
 * @param {Array} expenses - Array de gastos
 * @param {Date|string} startDate - Fecha de inicio
 * @param {Date|string} endDate - Fecha de fin
 * @returns {Array} - Gastos en el período
 */
export const getExpensesByPeriod = (expenses, startDate, endDate) => {
  if (!Array.isArray(expenses)) return []
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  return expenses.filter(expense => {
    if (!expense.date) return false
    const expenseDate = new Date(expense.date + 'T00:00:00')
    return expenseDate >= start && expenseDate <= end
  })
}

/**
 * Agrupa gastos por categoría y calcula totales (sin abonos)
 * @param {Array} expenses - Array de gastos
 * @returns {Object} - Objeto con categorías como keys y totales como values
 */
export const calculateExpensesByCategory = (expenses) => {
  if (!Array.isArray(expenses)) return {}
  
  const actualExpenses = getActualExpenses(expenses)
  
  return actualExpenses.reduce((acc, expense) => {
    const categoryName = expense.category?.name || 'Sin categoría'
    const categoryId = expense.category?.id || 'uncategorized'
    
    if (!acc[categoryId]) {
      acc[categoryId] = {
        id: categoryId,
        name: categoryName,
        color: expense.category?.color || '#6B7280',
        total: 0,
        count: 0,
        expenses: []
      }
    }
    
    acc[categoryId].total += expense.amount || 0
    acc[categoryId].count += 1
    acc[categoryId].expenses.push(expense)
    
    return acc
  }, {})
}

/**
 * Separa gastos en fijos y regulares (sin abonos)
 * @param {Array} expenses - Array de gastos
 * @returns {Object} - { fixed: Array, regular: Array }
 */
export const categorizeExpenses = (expenses) => {
  if (!Array.isArray(expenses)) return { fixed: [], regular: [] }
  
  const actualExpenses = getActualExpenses(expenses)
  
  return {
    fixed: actualExpenses.filter(expense => expense.isFixed),
    regular: actualExpenses.filter(expense => !expense.isFixed)
  }
}

/**
 * Calcula el total de gastos fijos (sin abonos)
 * @param {Array} expenses - Array de gastos
 * @returns {number} - Total de gastos fijos
 */
export const calculateFixedExpensesTotal = (expenses) => {
  const { fixed } = categorizeExpenses(expenses)
  return calculateExpensesTotal(fixed)
}

/**
 * Calcula el total de gastos regulares (sin abonos)
 * @param {Array} expenses - Array de gastos
 * @returns {number} - Total de gastos regulares
 */
export const calculateRegularExpensesTotal = (expenses) => {
  const { regular } = categorizeExpenses(expenses)
  return calculateExpensesTotal(regular)
}

/**
 * Calcula estadísticas de un conjunto de gastos
 * @param {Array} expenses - Array de gastos
 * @returns {Object} - Estadísticas completas
 */
export const calculateExpensesStats = (expenses) => {
  if (!Array.isArray(expenses)) {
    return {
      total: 0,
      count: 0,
      average: 0,
      fixed: 0,
      regular: 0,
      byCategory: {}
    }
  }
  
  const actualExpenses = getActualExpenses(expenses)
  const total = calculateExpensesTotal(actualExpenses)
  const count = actualExpenses.length
  
  return {
    total,
    count,
    average: count > 0 ? total / count : 0,
    fixed: calculateFixedExpensesTotal(actualExpenses),
    regular: calculateRegularExpensesTotal(actualExpenses),
    byCategory: calculateExpensesByCategory(actualExpenses)
  }
}

/**
 * Obtiene el promedio diario de gastos en un período (sin abonos)
 * @param {Array} expenses - Array de gastos
 * @param {number} days - Número de días en el período
 * @returns {number} - Promedio diario
 */
export const calculateDailyAverage = (expenses, days) => {
  if (!Array.isArray(expenses) || days <= 0) return 0
  const total = calculateExpensesTotal(expenses)
  return total / days
}

/**
 * Verifica si un gasto es de crédito
 * @param {Object} expense - El gasto a verificar
 * @returns {boolean}
 */
export const isCreditExpense = (expense) => {
  if (!expense) return false
  
  // Verificar por debtId (criterio principal)
  if (expense.debtId) return true
  
  // Backward compatibility por si hay datos antiguos
  const categoryName = expense.category?.name?.toLowerCase() || ''
  if (categoryName === 'crédito' || categoryName === 'credito') return true
  
  const description = expense.description?.toLowerCase() || ''
  if (description.includes('crédito') || description.includes('credito')) return true
  
  return false
}

/**
 * Separa gastos en efectivo vs crédito (sin abonos)
 * @param {Array} expenses - Array de gastos
 * @returns {Object} - { cash: Array, credit: Array }
 */
export const separateByCashAndCredit = (expenses) => {
  if (!Array.isArray(expenses)) return { cash: [], credit: [] }
  
  const actualExpenses = getActualExpenses(expenses)
  
  return {
    cash: actualExpenses.filter(expense => !isCreditExpense(expense)),
    credit: actualExpenses.filter(expense => isCreditExpense(expense))
  }
}


