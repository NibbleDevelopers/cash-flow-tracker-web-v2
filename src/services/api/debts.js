import { makeRequest } from '../httpClient'

const base = '/debts'

const toNumberOrNull = (v) => (v === null || v === undefined || v === '' ? null : Number(v))
const toIntOrNull = (v) => (v === null || v === undefined || v === '' ? null : parseInt(v))

export async function getDebts() {
  const response = await makeRequest(base)
  const items = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : [])
  return items.map(item => ({
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
  }))
}

export async function createDebt(payload) {
  const response = await makeRequest(base, { method: 'POST', body: JSON.stringify(payload) })
  return response?.data || response
}

export async function updateDebt(id, payload) {
  const response = await makeRequest(`${base}/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
  return response?.data || response
}

export async function deleteDebt(id) {
  return makeRequest(`${base}/${id}`, { method: 'DELETE' })
}

export async function getDebtSummary(id) {
  const response = await makeRequest(`${base}/${id}/summary`)
  return response?.data || response
}

export async function getDebtInstallments(id, { months, start } = {}) {
  const params = new URLSearchParams()
  if (months != null) params.set('months', String(months))
  if (start) params.set('start', start)
  const response = await makeRequest(`${base}/${id}/installments?${params.toString()}`)
  return response?.data || response
}


