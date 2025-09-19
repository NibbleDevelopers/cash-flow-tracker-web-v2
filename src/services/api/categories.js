import { makeRequest } from '../httpClient'

const base = '/categories'

export async function getCategories() {
  const response = await makeRequest(base)
  const items = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : [])
  return items.map(it => ({
    id: parseInt(it?.id) || 0,
    name: it?.name || '',
    type: it?.type ?? null,
    parentId: it?.parentId ?? null,
    color: it?.color || '#6B7280',
    active: true
  }))
}

export async function addCategory(category) {
  return category
}

export async function updateCategory(category) {
  return category
}


