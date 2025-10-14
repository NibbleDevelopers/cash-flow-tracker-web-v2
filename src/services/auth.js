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

export default {
  loginWithGoogle,
  setToken,
  getToken,
  removeToken,
  isAuthenticated,
  getUserInfo,
  logout
}

