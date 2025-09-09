import { useNotivue } from 'notivue'

export function useNotifications() {
  const { push } = useNotivue()

  const showSuccess = (message, title = 'Éxito') => {
    push.success({
      title,
      message,
      duration: 4000
    })
  }

  const showError = (message, title = 'Error') => {
    push.error({
      title,
      message,
      duration: 6000
    })
  }

  const showWarning = (message, title = 'Advertencia') => {
    push.warning({
      title,
      message,
      duration: 5000
    })
  }

  const showInfo = (message, title = 'Información') => {
    push.info({
      title,
      message,
      duration: 4000
    })
  }

  const showLoading = (message, title = 'Cargando...') => {
    return push.loading({
      title,
      message,
      duration: 0 // No se cierra automáticamente
    })
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading
  }
}
