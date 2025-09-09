import { ref, reactive, computed } from 'vue'

export function useForm(initialData = {}, validationRules = {}) {
  const form = reactive({ ...initialData })
  const errors = ref({})
  const isSubmitting = ref(false)
  const isDirty = ref(false)

  // Validar un campo específico
  const validateField = (fieldName, value) => {
    const rules = validationRules[fieldName]
    if (!rules) return true

    for (const rule of rules) {
      const result = rule(value, form)
      if (result !== true) {
        errors.value[fieldName] = result
        return false
      }
    }

    delete errors.value[fieldName]
    return true
  }

  // Validar todo el formulario
  const validateForm = () => {
    let isValid = true
    const newErrors = {}

    for (const [fieldName, rules] of Object.entries(validationRules)) {
      const value = form[fieldName]
      for (const rule of rules) {
        const result = rule(value, form)
        if (result !== true) {
          newErrors[fieldName] = result
          isValid = false
          break
        }
      }
    }

    errors.value = newErrors
    return isValid
  }

  // Resetear formulario
  const resetForm = () => {
    Object.assign(form, initialData)
    errors.value = {}
    isDirty.value = false
    isSubmitting.value = false
  }

  // Actualizar campo
  const updateField = (fieldName, value) => {
    form[fieldName] = value
    isDirty.value = true
    validateField(fieldName, value)
  }

  // Estado computado
  const isValid = computed(() => Object.keys(errors.value).length === 0)
  const hasErrors = computed(() => Object.keys(errors.value).length > 0)

  return {
    form,
    errors,
    isSubmitting,
    isDirty,
    isValid,
    hasErrors,
    validateField,
    validateForm,
    resetForm,
    updateField
  }
}

// Reglas de validación comunes
export const validationRules = {
  required: (message = 'Este campo es requerido') => (value) => {
    if (value === null || value === undefined || value === '') {
      return message
    }
    return true
  },

  minLength: (min, message) => (value) => {
    if (value && value.length < min) {
      return message || `Debe tener al menos ${min} caracteres`
    }
    return true
  },

  maxLength: (max, message) => (value) => {
    if (value && value.length > max) {
      return message || `No puede tener más de ${max} caracteres`
    }
    return true
  },

  min: (min, message) => (value) => {
    const num = Number(value)
    if (!isNaN(num) && num < min) {
      return message || `El valor mínimo es ${min}`
    }
    return true
  },

  max: (max, message) => (value) => {
    const num = Number(value)
    if (!isNaN(num) && num > max) {
      return message || `El valor máximo es ${max}`
    }
    return true
  },

  email: (message = 'Email inválido') => (value) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return message
    }
    return true
  },

  numeric: (message = 'Debe ser un número') => (value) => {
    if (value && isNaN(Number(value))) {
      return message
    }
    return true
  },

  positive: (message = 'Debe ser un número positivo') => (value) => {
    const num = Number(value)
    if (!isNaN(num) && num <= 0) {
      return message
    }
    return true
  }
}
