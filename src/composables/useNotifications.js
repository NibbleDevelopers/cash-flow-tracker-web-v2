import { useNotivue } from 'notivue'

/**
 * Composable para manejar notificaciones con fallback a console
 * @returns {Object} - Objeto con métodos de notificación
 */
export function useNotifications() {
  let push = null
  
  try {
    const notivue = useNotivue()
    push = notivue?.push
  } catch (error) {
    console.warn('Notivue no está disponible:', error)
  }

  /**
   * Muestra una notificación de éxito
   * @param {string} message - Mensaje a mostrar
   * @param {string} title - Título de la notificación
   */
  const showSuccess = (message, title = 'Éxito') => {
    if (push?.success) {
      push.success({ title, message, duration: 4000 })
    } else {
      console.log(`✅ ${title}: ${message}`)
    }
  }

  /**
   * Muestra una notificación de error
   * @param {string} message - Mensaje a mostrar
   * @param {string} title - Título de la notificación
   */
  const showError = (message, title = 'Error') => {
    if (push?.error) {
      push.error({ title, message, duration: 6000 })
    } else {
      console.error(`❌ ${title}: ${message}`)
    }
  }

  /**
   * Muestra una notificación de advertencia
   * @param {string} message - Mensaje a mostrar
   * @param {string} title - Título de la notificación
   */
  const showWarning = (message, title = 'Advertencia') => {
    if (push?.warning) {
      push.warning({ title, message, duration: 5000 })
    } else {
      console.warn(`⚠️ ${title}: ${message}`)
    }
  }

  /**
   * Muestra una notificación informativa
   * @param {string} message - Mensaje a mostrar
   * @param {string} title - Título de la notificación
   */
  const showInfo = (message, title = 'Información') => {
    if (push?.info) {
      push.info({ title, message, duration: 4000 })
    } else {
      console.info(`ℹ️ ${title}: ${message}`)
    }
  }

  /**
   * Muestra una notificación de carga
   * @param {string} message - Mensaje a mostrar
   * @param {string} title - Título de la notificación
   * @returns {Object} - Objeto con método dismiss
   */
  const showLoading = (message, title = 'Cargando...') => {
    if (push?.loading) {
      return push.loading({ title, message, duration: 0 })
    } else {
      console.log(`⏳ ${title}: ${message}`)
      return { dismiss: () => {} }
    }
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading
  }
}
