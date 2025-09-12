import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import backend from '../services/googleSheetsBackend'
import { notify } from '../services/notifications.js'

// Constantes
const DEBT_VALIDATION = {
  CREDIT_LIMIT_MIN: 0,
  BALANCE_MIN: 0,
  DUE_DAY_MIN: 1,
  DUE_DAY_MAX: 31,
  INTEREST_MIN: 0,
  INTEREST_MAX: 100,
  MASK_PAN_MAX_LENGTH: 64,
  BRAND_MAX_LENGTH: 50
}

export const useDebtStore = defineStore('debt', () => {
  const debts = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters computados
  const activeDebts = computed(() => debts.value.filter(debt => debt.active))
  const totalBalance = computed(() => 
    debts.value.reduce((sum, debt) => sum + (Number(debt.balance) || 0), 0)
  )
  const totalCreditLimit = computed(() => 
    debts.value.reduce((sum, debt) => sum + (Number(debt.creditLimit) || 0), 0)
  )
  const utilizationRate = computed(() => 
    totalCreditLimit.value > 0 ? (totalBalance.value / totalCreditLimit.value) * 100 : 0
  )

  // Funciones de validación
  const validateDebtData = (data) => {
    const errors = []
    
    if (!data.name?.trim()) {
      errors.push('El nombre es requerido')
    }
    
    if (data.creditLimit < DEBT_VALIDATION.CREDIT_LIMIT_MIN) {
      errors.push('El límite de crédito debe ser mayor o igual a 0')
    }
    
    if (data.balance < DEBT_VALIDATION.BALANCE_MIN) {
      errors.push('El saldo debe ser mayor o igual a 0')
    }
    
    if (data.dueDay && (data.dueDay < DEBT_VALIDATION.DUE_DAY_MIN || data.dueDay > DEBT_VALIDATION.DUE_DAY_MAX)) {
      errors.push('El día de pago debe estar entre 1 y 31')
    }
    
    if (data.cutOffDay && (data.cutOffDay < DEBT_VALIDATION.DUE_DAY_MIN || data.cutOffDay > DEBT_VALIDATION.DUE_DAY_MAX)) {
      errors.push('El día de corte debe estar entre 1 y 31')
    }
    
    if (data.interesEfectivo != null && (data.interesEfectivo < DEBT_VALIDATION.INTEREST_MIN || data.interesEfectivo > DEBT_VALIDATION.INTEREST_MAX)) {
      errors.push('El interés efectivo debe estar entre 0 y 100')
    }
    
    if (data.maskPan && data.maskPan.length > DEBT_VALIDATION.MASK_PAN_MAX_LENGTH) {
      errors.push(`La máscara PAN no puede exceder ${DEBT_VALIDATION.MASK_PAN_MAX_LENGTH} caracteres`)
    }
    
    if (data.brand && data.brand.length > DEBT_VALIDATION.BRAND_MAX_LENGTH) {
      errors.push(`La marca no puede exceder ${DEBT_VALIDATION.BRAND_MAX_LENGTH} caracteres`)
    }
    
    return errors
  }

  const loadDebts = async () => {
    loading.value = true
    error.value = null
    try {
      debts.value = await backend.getDebts()
    } catch (err) {
      error.value = 'Error al cargar deudas'
      console.error('loadDebts error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createDebt = async (data) => {
    loading.value = true
    error.value = null
    
    try {
      // Validar datos antes de enviar
      const validationErrors = validateDebtData(data)
      if (validationErrors.length > 0) {
        error.value = validationErrors.join(', ')
        throw new Error(validationErrors.join(', '))
      }

      const debtData = {
        name: data.name.trim(),
        issuer: data.issuer?.trim() || '',
        creditLimit: Number(data.creditLimit) || 0,
        balance: Number(data.balance) || 0,
        dueDay: data.dueDay ? parseInt(data.dueDay) : undefined,
        cutOffDay: data.cutOffDay ? parseInt(data.cutOffDay) : undefined,
        active: data.active !== false,
        maskPan: data.maskPan?.trim() || '',
        interesEfectivo: data.interesEfectivo != null ? Number(data.interesEfectivo) : undefined,
        brand: data.brand?.trim() || ''
      }

      const created = await backend.createDebt(debtData)
      
      // Actualización optimista
      if (created && typeof created === 'object' && created.id) {
        const exists = debts.value.some(d => d.id === created.id)
        if (!exists) debts.value.push(created)
      } else {
        await loadDebts()
      }
      
      notify.success('Deuda creada exitosamente')
      return created
    } catch (err) {
      error.value = err.message || 'Error al crear deuda'
      notify.error(err.message || 'Error al crear deuda')
      console.error('createDebt error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateDebt = async (id, data) => {
    loading.value = true
    error.value = null
    try {
      const updated = await backend.updateDebt(id, {
        name: data.name,
        issuer: data.issuer,
        creditLimit: data.creditLimit != null ? Number(data.creditLimit) : undefined,
        balance: data.balance != null ? Number(data.balance) : undefined,
        dueDay: data.dueDay != null ? parseInt(data.dueDay) : undefined,
        cutOffDay: data.cutOffDay != null ? parseInt(data.cutOffDay) : undefined,
        active: data.active,
        maskPan: data.maskPan,
        interesEfectivo: data.interesEfectivo != null ? Number(data.interesEfectivo) : undefined,
        brand: data.brand
      })
      if (updated && typeof updated === 'object') {
        const idx = debts.value.findIndex(d => d.id === updated.id)
        if (idx !== -1) debts.value[idx] = updated
      } else {
        await loadDebts()
      }
      notify.success('Deuda actualizada exitosamente')
      return updated
    } catch (err) {
      error.value = 'Error al actualizar deuda'
      notify.error('Error al actualizar deuda')
      console.error('updateDebt error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteDebt = async (id) => {
    loading.value = true
    error.value = null
    try {
      await backend.deleteDebt(id)
      debts.value = debts.value.filter(d => String(d.id) !== String(id))
      notify.success('Deuda eliminada exitosamente')
      return true
    } catch (err) {
      error.value = 'Error al eliminar deuda'
      notify.error('Error al eliminar deuda')
      console.error('deleteDebt error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchDebtSummary = async (id) => {
    try {
      return await backend.getDebtSummary(id)
    } catch (_) {
      return null
    }
  }

  const fetchDebtInstallments = async (id, params) => {
    try {
      return await backend.getDebtInstallments(id, params)
    } catch (_) {
      return null
    }
  }

  const clearError = () => { error.value = null }

  return {
    // State
    debts,
    loading,
    error,
    
    // Getters
    activeDebts,
    totalBalance,
    totalCreditLimit,
    utilizationRate,
    
    // Actions
    loadDebts,
    createDebt,
    updateDebt,
    deleteDebt,
    fetchDebtSummary,
    fetchDebtInstallments,
    clearError,
    validateDebtData
  }
})


