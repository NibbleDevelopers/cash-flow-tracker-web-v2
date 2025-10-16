/**
 * Servicio de Autenticación OAuth con Google
 */

const TOKEN_KEY = 'cash_flow_auth_token'
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/**
 * Redirige al usuario al flujo de OAuth de Google
 */
export const loginWithGoogle = () => {
  window.location.href = `${API_BASE_URL}/api/auth/google`
}

/**
 * Guarda el token JWT en localStorage
 * @param {string} token - JWT token
 */
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * Obtiene el token JWT del localStorage
 * @returns {string|null} - JWT token o null si no existe
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Elimina el token (logout)
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = getToken()
  if (!token) return false
  
  try {
    // Verificar si el token no está expirado (decodificar JWT)
    const payload = JSON.parse(atob(token.split('.')[1]))
    const expirationTime = payload.exp * 1000 // Convertir a milisegundos
    
    if (Date.now() >= expirationTime) {
      // Token expirado
      removeToken()
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error verificando token:', error)
    removeToken()
    return false
  }
}

/**
 * Obtiene la información del usuario desde el token
 * @returns {Object|null} - Datos del usuario o null
 */
export const getUserInfo = () => {
  const token = getToken()
  if (!token) return null
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      sub: payload.sub
    }
  } catch (error) {
    console.error('Error obteniendo info del usuario:', error)
    return null
  }
}

/**
 * Cierra sesión del usuario
 */
export const logout = () => {
  removeToken()
  window.location.href = '/login'
}

/**
 * Verifica si el token está por expirar (menos de 5 minutos restantes)
 * @returns {boolean}
 */
export const isTokenExpiringSoon = () => {
  const token = getToken()
  if (!token) return false
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const expirationTime = payload.exp * 1000
    const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000) // 5 minutos en ms
    
    return expirationTime < fiveMinutesFromNow
  } catch (error) {
    console.error('Error verificando expiración del token:', error)
    return false
  }
}

/**
 * Obtiene el tiempo restante hasta que expire el token (en segundos)
 * @returns {number} - Segundos restantes, 0 si no hay token o está expirado
 */
export const getTokenTimeRemaining = () => {
  const token = getToken()
  if (!token) return 0
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const expirationTime = payload.exp * 1000
    const timeRemaining = Math.max(0, Math.floor((expirationTime - Date.now()) / 1000))
    
    return timeRemaining
  } catch (error) {
    console.error('Error calculando tiempo restante:', error)
    return 0
  }
}

/**
 * Refresca el token de autenticación
 * @returns {Promise<boolean>} - true si se refrescó exitosamente
 */
export const refreshToken = async () => {
  const currentToken = getToken()
  if (!currentToken) {
    console.warn('No hay token para refrescar')
    return false
  }
  
  try {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      }
    })
    
    if (!response.ok) {
      console.error('Error refrescando token:', response.status)
      return false
    }
    
    const data = await response.json()
    
    if (data.token) {
      setToken(data.token)
      console.log('✅ Token refrescado exitosamente')
      return true
    }
    
    return false
  } catch (error) {
    console.error('Error en refresh token:', error)
    return false
  }
}

/**
 * Inicia el sistema de auto-refresh del token
 * Verifica cada minuto si el token está por expirar
 * @returns {Function} - Función para detener el auto-refresh
 */
export const startTokenRefreshTimer = () => {
  // Verificar inmediatamente
  checkAndRefreshToken()
  
  // Luego verificar cada minuto
  const intervalId = setInterval(checkAndRefreshToken, 60 * 1000)
  
  // Retornar función para limpiar el interval
  return () => clearInterval(intervalId)
}

/**
 * Verifica y refresca el token si está por expirar
 */
const checkAndRefreshToken = async () => {
  if (!isAuthenticated()) {
    return
  }
  
  if (isTokenExpiringSoon()) {
    const timeRemaining = getTokenTimeRemaining()
    console.log(`⏰ Token expira en ${Math.floor(timeRemaining / 60)} minutos. Refrescando...`)
    
    const refreshed = await refreshToken()
    
    if (!refreshed) {
      console.warn('❌ No se pudo refrescar el token. El usuario será deslogueado cuando expire.')
    }
  }
}

export default {
  loginWithGoogle,
  setToken,
  getToken,
  removeToken,
  isAuthenticated,
  getUserInfo,
  logout,
  isTokenExpiringSoon,
  getTokenTimeRemaining,
  refreshToken,
  startTokenRefreshTimer
}

