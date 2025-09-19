import { makeRequest } from '../httpClient'

const base = '/budget'

export async function getBudget() {
  const response = await makeRequest(base)
  const currentMonth = new Date().toISOString().slice(0, 7)
  const items = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : [])
  const budgets = items.map(it => ({ month: String(it?.month || ''), amount: Number(it?.amount) || 0 }))
  const match = budgets.find(b => b.month === currentMonth)
  return match || { month: currentMonth, amount: 0 }
}

export async function getBudgets() {
  const response = await makeRequest(base)
  const items = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : [])
  const map = {}
  for (const it of items) {
    const month = String(it?.month || '')
    const amount = Number(it?.amount) || 0
    if (month) map[month] = amount
  }
  return map
}

export async function updateBudget(budget) {
  return makeRequest(base, { method: 'PUT', body: JSON.stringify(budget) })
}


