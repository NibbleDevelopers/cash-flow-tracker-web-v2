import { makeRequest } from '../httpClient'

const base = '/expenses'

export async function getExpenses() {
  const response = await makeRequest(base)
  const items = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : [])
  return items.map(it => ({
    id: String(it?.id || ''),
    date: it?.date || new Date().toISOString().slice(0,10),
    description: it?.description || '',
    amount: Number(it?.amount) || 0,
    categoryId: parseInt(it?.categoryId) || 0,
    isFixed: !!it?.isFixed,
    fixedExpenseId: it?.fixedExpenseId ?? null
  }))
}

export async function addExpense(expense) {
  return makeRequest(base, { method: 'POST', body: JSON.stringify(expense) })
}

export async function addExpensesBatch(expenses) {
  return makeRequest(`${base}/batch`, { method: 'POST', body: JSON.stringify({ expenses }) })
}

export async function updateExpense(id, data) {
  return makeRequest(`${base}/${id}`, { method: 'PUT', body: JSON.stringify({ ...data }) })
}

export async function deleteExpense(id) {
  return makeRequest(`${base}/${id}`, { method: 'DELETE' })
}


