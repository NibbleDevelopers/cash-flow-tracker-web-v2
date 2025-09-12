import { reactive } from 'vue'

export const confirmState = reactive({
  isOpen: false,
  title: '',
  message: '',
  confirmText: 'Aceptar',
  cancelText: 'Cancelar',
  variant: 'primary',
  persistent: false,
  resolve: null
})

export function useConfirm() {
  const show = (messageOrOptions) => {
    const options = typeof messageOrOptions === 'string' ? { message: messageOrOptions } : (messageOrOptions || {})
    return new Promise((resolve) => {
      confirmState.title = options.title || 'Confirmar acción'
      confirmState.message = options.message || ''
      confirmState.confirmText = options.confirmText || 'Aceptar'
      confirmState.cancelText = options.cancelText || 'Cancelar'
      confirmState.variant = options.variant || 'primary'
      confirmState.persistent = !!options.persistent
      confirmState.resolve = resolve
      confirmState.isOpen = true
    })
  }
  return { show }
}

export function resolveConfirm(result) {
  if (typeof confirmState.resolve === 'function') {
    confirmState.resolve(result)
  }
  confirmState.isOpen = false
  confirmState.resolve = null
}


