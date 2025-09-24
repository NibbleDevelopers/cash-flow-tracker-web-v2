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
    fixedExpenseId: it?.fixedExpenseId ?? null,
    entryType: (it?.entryType || '').toString().toLowerCase() || undefined,
    status: (it?.status || '').toString().toLowerCase() || undefined,
    debtId: it?.debtId ?? null
  }))
}

export async function addExpense(expense) {
  const payload = normalizeExpensePayload(expense)
  return makeRequest(base, { method: 'POST', body: JSON.stringify(payload) })
}

export async function addExpensesBatch(expenses) {
  const normalized = (expenses || []).map(normalizeExpensePayload)
  return makeRequest(`${base}/batch`, { method: 'POST', body: JSON.stringify({ expenses: normalized }) })
}

export async function updateExpense(id, data) {
  const payload = normalizeExpensePayload(data)
  return makeRequest(`${base}/${id}`, { method: 'PUT', body: JSON.stringify({ ...payload }) })
}

export async function deleteExpense(id) {
  return makeRequest(`${base}/${id}`, { method: 'DELETE' })
}

function normalizeExpensePayload(expense) {
  const entryType = expense?.entryType != null ? String(expense.entryType).toLowerCase() : undefined
  const status = expense?.status != null ? String(expense.status).toLowerCase() : undefined
  return {
    ...expense,
    entryType,
    status,
    debtId: expense?.debtId ?? null
  }
}


