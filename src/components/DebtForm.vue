<template>
  <form @submit.prevent="onSubmit" class="space-y-4">
    <!-- Mensajes de error -->
    <div v-if="errors.length > 0" class="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex">
        <svg class="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <div>
          <h3 class="text-sm font-medium text-red-800">Por favor corrige los siguientes errores:</h3>
          <ul class="mt-2 text-sm text-red-700 list-disc list-inside">
            <li v-for="error in errors" :key="error">{{ error }}</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Identidad -->
      <div>
        <label for="debt-name" class="block text-sm font-medium text-gray-700">
          Nombre <span class="text-red-500">*</span>
        </label>
        <input 
          id="debt-name"
          ref="nameInput"
          v-model="form.name" 
          required 
          class="input-field h-10" 
          :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors.some(e => e.includes('nombre')) }"
          placeholder="Tarjeta Visa BBVA" 
          aria-describedby="debt-name-error"
        />
        <p v-if="errors.some(e => e.includes('nombre'))" id="debt-name-error" class="mt-1 text-sm text-red-600">
          El nombre es requerido
        </p>
      </div>

      <div>
        <label for="debt-issuer" class="block text-sm font-medium text-gray-700">Emisor</label>
        <input 
          id="debt-issuer"
          v-model="form.issuer" 
          class="input-field h-10" 
          placeholder="BBVA" 
        />
      </div>

      <div>
        <label for="debt-brand" class="block text-sm font-medium text-gray-700">Tipo de tarjeta</label>
        <AppSelect
          v-model="form.brand"
          :options="cardTypeOptions"
          placeholder="Selecciona el tipo"
          size="sm"
        />
      </div>

      <div>
        <label for="debt-mask-pan" class="block text-sm font-medium text-gray-700">Últimos 4 dígitos</label>
        <input 
          id="debt-mask-pan"
          v-model="form.maskPan" 
          maxlength="4" 
          pattern="[0-9]{4}"
          class="input-field h-10" 
          :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors.some(e => e.includes('máscara')) }"
          placeholder="1234"
          @input="validateLastFourDigits"
        />
        <p class="mt-1 text-xs text-gray-500">Solo los últimos 4 dígitos de la tarjeta</p>
      </div>

      <!-- Fechas: Corte primero, luego Pago -->
      <div>
        <label for="debt-cutoff-day" class="block text-sm font-medium text-gray-700">Día de corte</label>
        <input 
          id="debt-cutoff-day"
          v-model.number="form.cutOffDay" 
          type="number" 
          min="1" 
          max="31" 
          class="input-field h-10" 
          :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors.some(e => e.includes('corte')) }"
          placeholder="25"
        />
        <p class="mt-1 text-xs text-gray-500">Día del mes (1-31)</p>
      </div>

      <div>
        <label for="debt-due-day" class="block text-sm font-medium text-gray-700">Día de pago</label>
        <input 
          id="debt-due-day"
          v-model.number="form.dueDay" 
          type="number" 
          min="1" 
          max="31" 
          class="input-field h-10" 
          :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors.some(e => e.includes('pago')) }"
          placeholder="10"
        />
        <p class="mt-1 text-xs text-gray-500">Día del mes (1-31)</p>
      </div>

      <!-- Montos: Límite, Saldo, Interés -->
      <div>
        <label for="debt-credit-limit" class="block text-sm font-medium text-gray-700">Límite de crédito</label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span class="text-gray-500 sm:text-sm">$</span>
          </div>
          <input 
            id="debt-credit-limit"
            v-model.number="form.creditLimit" 
            type="number" 
            min="0" 
            step="0.01" 
            class="input-field h-10 pl-7" 
            :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors.some(e => e.includes('límite')) }"
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <label for="debt-balance" class="block text-sm font-medium text-gray-700">Saldo actual</label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span class="text-gray-500 sm:text-sm">$</span>
          </div>
          <input 
            id="debt-balance"
            v-model.number="form.balance" 
            type="number" 
            min="0" 
            step="0.01" 
            class="input-field h-10 pl-7" 
            :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors.some(e => e.includes('saldo')) }"
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <label for="debt-interest" class="block text-sm font-medium text-gray-700">Interés efectivo anual (%)</label>
        <div class="relative">
          <input 
            id="debt-interest"
            v-model.number="form.interesEfectivo" 
            type="number" 
            min="0" 
            max="100" 
            step="0.01" 
            class="input-field h-10 pr-8" 
            :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors.some(e => e.includes('interés')) }"
            placeholder="35.5"
          />
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span class="text-gray-500 sm:text-sm">%</span>
          </div>
        </div>
      </div>

      <!-- Estado -->
      <div class="flex items-center space-x-3">
        <Switch
          v-model="form.active"
          :class="form.active ? 'bg-primary-600' : 'bg-gray-200'"
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
          <span class="sr-only">Activa</span>
          <span
            :class="form.active ? 'translate-x-6' : 'translate-x-1'"
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
        </Switch>
        <label for="debt-active" class="text-sm font-medium text-gray-700">Activa</label>
      </div>
    </div>
    
    <div class="flex justify-end space-x-2 pt-2">
      <button type="button" class="btn-secondary" @click="$emit('cancel')">Cancelar</button>
      <button type="submit" class="btn-primary" :disabled="loading">
        <span v-if="loading" class="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
        {{ submitText }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { reactive, watch, ref, computed, onMounted, nextTick } from 'vue'
import { Switch } from '@headlessui/vue'
import AppSelect from './ui/AppSelect.vue'

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
  submitText: { type: String, default: 'Guardar' },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'submit', 'cancel'])

const errors = ref([])

// Opciones para el tipo de tarjeta
const cardTypeOptions = [
  { label: 'Visa', value: 'Visa' },
  { label: 'Mastercard', value: 'Mastercard' },
  { label: 'American Express', value: 'American Express' }
]

const form = reactive({
  id: undefined,
  name: '',
  issuer: '',
  creditLimit: 0,
  balance: 0,
  dueDay: undefined,
  cutOffDay: undefined,
  maskPan: '',
  interesEfectivo: undefined,
  brand: '',
  active: true
})

// Validación en tiempo real
const validateForm = () => {
  const newErrors = []
  
  if (!form.name?.trim()) {
    newErrors.push('El nombre es requerido')
  }
  
  if (form.creditLimit < 0) {
    newErrors.push('El límite de crédito debe ser mayor o igual a 0')
  }
  
  if (form.balance < 0) {
    newErrors.push('El saldo debe ser mayor o igual a 0')
  }
  
  if (form.dueDay && (form.dueDay < 1 || form.dueDay > 31)) {
    newErrors.push('El día de pago debe estar entre 1 y 31')
  }
  
  if (form.cutOffDay && (form.cutOffDay < 1 || form.cutOffDay > 31)) {
    newErrors.push('El día de corte debe estar entre 1 y 31')
  }
  
  if (form.interesEfectivo != null && (form.interesEfectivo < 0 || form.interesEfectivo > 100)) {
    newErrors.push('El interés efectivo debe estar entre 0 y 100')
  }
  
  if (form.maskPan && form.maskPan.length !== 4) {
    newErrors.push('Los últimos 4 dígitos deben ser exactamente 4 números')
  }
  
  if (form.maskPan && !/^\d{4}$/.test(form.maskPan)) {
    newErrors.push('Los últimos 4 dígitos solo pueden contener números')
  }
  
  if (!form.brand) {
    newErrors.push('Debes seleccionar el tipo de tarjeta')
  }
  
  errors.value = newErrors
  return newErrors.length === 0
}

// Validar últimos 4 dígitos
const validateLastFourDigits = (event) => {
  const input = event.target
  const value = input.value
  
  // Solo permitir números
  const numbersOnly = value.replace(/\D/g, '')
  
  // Limitar a 4 dígitos
  if (numbersOnly.length > 4) {
    form.maskPan = numbersOnly.slice(0, 4)
  } else {
    form.maskPan = numbersOnly
  }
}

const isFormValid = computed(() => validateForm())

watch(() => props.modelValue, (val) => {
  Object.assign(form, {
    id: val?.id,
    name: val?.name || '',
    issuer: val?.issuer || '',
    creditLimit: Number(val?.creditLimit) || 0,
    balance: Number(val?.balance) || 0,
    dueDay: val?.dueDay ?? undefined,
    cutOffDay: val?.cutOffDay ?? undefined,
    maskPan: val?.maskPan || '',
    interesEfectivo: val?.interesEfectivo ?? undefined,
    brand: val?.brand || '',
    active: val?.active !== false
  })
  
  // Limpiar errores al cambiar el modelo
  errors.value = []
}, { immediate: true })

watch(form, () => {
  emit('update:modelValue', { ...form })
  // Validar en tiempo real
  validateForm()
}, { deep: true })

const onSubmit = () => {
  if (isFormValid.value) {
    emit('submit', { ...form })
  }
}

// Foco inicial en Nombre
const nameInput = ref(null)
onMounted(async () => {
  await nextTick()
  nameInput.value?.focus()
})
</script>


