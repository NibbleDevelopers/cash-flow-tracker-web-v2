import { makeRequest } from '../httpClient'

const base = '/categories'

export async function getCategories() {
  const response = await makeRequest(base)
  const items = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : [])
  return items.map(it => ({
    // Mantener el ID tal como viene del backend (como string) para evitar colisiones
    id: String(it?.id ?? ''),
    name: it?.name || '',
    type: it?.type ?? null,
    parentId: it?.parentId ?? null,
    color: it?.color || '#6B7280',
    // Respetar flag activo del backend; por defecto true si no viene
    active: it?.active !== false
  }))
}

export async function addCategory(category) {
  return category
}

export async function updateCategory(category) {
  return category
}


