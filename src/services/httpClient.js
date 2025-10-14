// Ligero cliente HTTP con manejo de baseURL, headers, autenticación y mensajes de error

import { getToken, removeToken } from './auth.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

function joinUrl(base, endpoint) {
  if (!base) return endpoint
  if (!endpoint) return base
  if (base.endsWith('/') && endpoint.startsWith('/')) return base + endpoint.slice(1)
  if (!base.endsWith('/') && !endpoint.startsWith('/')) return `${base}/${endpoint}`
  return base + endpoint
}

export async function makeRequest(endpoint, options = {}) {
  const url = joinUrl(API_BASE_URL, endpoint)

  // Obtener token de autenticación
  const token = getToken()
  
  // Preparar headers con token si existe
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {})
  }
  
  // Agregar Authorization header si hay token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Opcional: timeout simple
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || 30000)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers
    })

    if (!response.ok) {
      // Manejar error 401 (no autorizado o token expirado)
      if (response.status === 401) {
        removeToken()
        window.location.href = '/login'
        throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.')
      }
      
      let errorMessage = `Error ${response.status}: ${response.statusText}`
      try {
        const data = await response.json()
        errorMessage = data?.message || data?.error || errorMessage
      } catch {
        const text = await response.text()
        if (text) errorMessage = text
      }
      throw new Error(errorMessage)
    }

    if (response.status === 204) return {}
    try {
      return await response.json()
    } catch (parseError) {
      console.warn('Failed to parse response as JSON:', parseError)
      return {}
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('La solicitud tardó demasiado y fue cancelada.')
    }
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.')
    }
    console.error('HTTP error:', error)
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}


