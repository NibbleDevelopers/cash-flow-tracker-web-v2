import { makeRequest } from '../httpClient'

const base = '/fixed-expenses'

export async function getFixedExpenses() {
  const response = await makeRequest(base)
  const items = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : [])
  return items.map(it => ({
    id: String(it?.id || ''),
    name: it?.name || '',
    amount: Number(it?.amount) || 0,
    categoryId: parseInt(it?.categoryId) || 0,
    dayOfMonth: parseInt(it?.dayOfMonth) || 1,
    active: it?.active !== false
  })).filter(expense => expense.active)
}

export async function addFixedExpense(fixedExpense) {
  return makeRequest(base, { method: 'POST', body: JSON.stringify(fixedExpense) })
}

export async function updateFixedExpense(id, data) {
  return makeRequest(`${base}/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteFixedExpense(id) {
  return makeRequest(`${base}/${id}`, { method: 'DELETE' })
}

export async function generateFixedExpensesForMonth(month) {
  return makeRequest('/generate-fixed-expenses', { method: 'POST', body: JSON.stringify({ month }) })
}

export async function generateFixedExpensesForMonthBatch(month) {
  return makeRequest('/generate-fixed-expenses/batch', { method: 'POST', body: JSON.stringify({ month }) })
}

export async function checkFixedExpenseExists(description, categoryId) {
  const response = await makeRequest('/check-fixed-expense', { method: 'POST', body: JSON.stringify({ description, categoryId }) })
  return response.exists
}


