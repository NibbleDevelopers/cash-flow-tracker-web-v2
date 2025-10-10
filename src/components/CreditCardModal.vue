<template>
  <TransitionRoot as="template" :show="!!creditData">
    <Dialog class="relative z-50" @close="$emit('close')">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="ease-out duration-500"
            enter-from="opacity-0 translate-y-8 scale-95"
            enter-to="opacity-100 translate-y-0 scale-100"
            leave="ease-in duration-300"
            leave-from="opacity-100 translate-y-0 scale-100"
            leave-to="opacity-0 translate-y-8 scale-95"
          >
            <DialogPanel class="relative transform overflow-hidden bg-white shadow-xl transition-all w-full max-w-lg rounded-lg">
              <!-- Header -->
              <div class="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-lg font-semibold text-white">{{ creditData?.name }}</h3>
                      <p class="text-blue-100 text-sm">{{ creditData?.issuer || 'Sin emisor' }}</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span :class="[
                      'px-3 py-1 rounded-full text-xs font-medium',
                      creditData?.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    ]">
                      {{ creditData?.active ? 'Activa' : 'Inactiva' }}
                    </span>
                    <button
                      @click="$emit('close')"
                      class="text-white/80 hover:text-white transition-colors duration-200"
                    >
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Content - Credit Card Design -->
              <div class="px-2 py-4">
                <!-- Credit Card Container -->
                <div class="relative max-w-sm mx-auto sm:max-w-lg">
                  <!-- Credit Card -->
                  <div class="relative text-white shadow-2xl overflow-hidden rounded-xl p-3 sm:p-4"
                       :class="[
                         getCardGradient(creditData?.brand),
                         'aspect-[3.375/2.125] sm:aspect-[3.375/2.125] md:aspect-[3.375/2.125]',
                         'min-h-[220px] sm:min-h-0'
                       ]">
                    <!-- Card Background Pattern -->
                    <div class="absolute inset-0 opacity-10">
                      <div class="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
                      <div class="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
                    </div>
                    
                    <!-- Card Content -->
                    <div class="relative z-10 h-full flex flex-col justify-between">
                      <!-- Card Header -->
                      <div class="flex justify-between items-start">
                        <div class="flex items-center">
                          <CreditCardIcon 
                            :type="getCardType(creditData?.brand)" 
                            size="medium" 
                          />
                        </div>
                        <div class="text-right">
                          <div class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium uppercase"
                               :class="creditData?.active ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'">
                            <svg class="w-2 h-2 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path :fill-rule="creditData?.active ? 'evenodd' : 'evenodd'" 
                                    :d="creditData?.active ? 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' : 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'" 
                                    clip-rule="evenodd" />
                            </svg>
                            {{ creditData?.active ? 'ACTIVA' : 'INACTIVA' }}
                          </div>
                        </div>
                      </div>

                      <!-- Card Number -->
                      <div class="text-center">
                        <p class="text-xs text-gray-300 mb-1">Número de Tarjeta</p>
                        <p class="text-lg font-mono tracking-wider">
                          {{ creditData?.maskPan ? `•••• •••• •••• ${creditData.maskPan}` : '•••• •••• •••• ••••' }}
                        </p>
                      </div>

                      <!-- Bottom Row -->
                      <div class="flex justify-between items-end gap-2">
                        <!-- Financial Information -->
                        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-1.5 sm:p-2 flex-1">
                          <div class="grid grid-cols-2 gap-1 mb-1 sm:mb-1.5">
                            <div>
                              <p class="text-xs text-gray-300 mb-0.5">Saldo</p>
                              <p class="text-xs font-bold">{{ formatCurrency(creditData?.balance || 0) }}</p>
                            </div>
                            <div>
                              <p class="text-xs text-gray-300 mb-0.5">Límite</p>
                              <p class="text-xs font-bold">{{ formatCurrency(creditData?.creditLimit || 0) }}</p>
                            </div>
                          </div>
                          
                          <!-- Credit Utilization -->
                          <div>
                            <div class="flex justify-between items-center mb-0.5 sm:mb-1">
                              <span class="text-xs text-gray-300">Utilización</span>
                              <span class="text-xs font-bold px-1 py-0.5 rounded-full"
                                    :class="getUtilizationColor(creditData?.balance, creditData?.creditLimit)">
                                {{ getUtilizationPercentage(creditData?.balance, creditData?.creditLimit) }}%
                              </span>
                            </div>
                            <div class="h-1 bg-white/20 rounded-full overflow-hidden">
                              <div
                                class="h-full transition-all duration-1000 ease-out rounded-full"
                                :class="getUtilizationBarColor(creditData?.balance, creditData?.creditLimit)"
                                :style="{ width: getUtilizationPercentage(creditData?.balance, creditData?.creditLimit) + '%' }"
                              ></div>
                            </div>
                          </div>
                        </div>

                        <!-- Card Holder and Expiry -->
                        <div class="text-right flex-shrink-0">
                          <div class="mb-1">
                            <p class="text-xs text-gray-300 mb-0.5">Titular</p>
                            <p class="text-xs font-bold">{{ creditData?.brand || 'TARJETA DE CRÉDITO' }}</p>
                          </div>
                          <div>
                            <p class="text-xs text-gray-300 mb-0.5">Válida hasta</p>
                            <p class="text-xs font-bold">12/28</p>
                          </div>
                        </div>
                      </div>

                      <!-- Available Credit -->
                      <div class="text-center mt-1">
                        <p class="text-xs text-gray-300 mb-0.5">Crédito Disponible</p>
                        <p class="text-sm font-bold text-green-400">
                          {{ formatCurrency((creditData?.creditLimit || 0) - (creditData?.balance || 0)) }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Card Information Panel -->
                  <div class="mt-4 bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div class="grid grid-cols-2 gap-3">
                      <!-- Cut-off Date -->
                      <div class="flex items-center space-x-2">
                        <div class="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                          <svg class="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p class="text-xs text-gray-500 mb-0.5">Día de corte</p>
                          <p class="text-sm font-medium text-gray-700">
                            {{ creditData?.cutOffDay || 'No configurado' }}
                          </p>
                        </div>
                      </div>

                      <!-- Payment Date -->
                      <div class="flex items-center space-x-2">
                        <div class="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                          <svg class="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <div>
                          <p class="text-xs text-gray-500 mb-0.5">Día de pago</p>
                          <p class="text-sm font-medium text-gray-700">
                            {{ creditData?.dueDay || 'No configurado' }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="bg-gray-50 px-6 py-5 border-t border-gray-200">
                <div class="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <div class="flex items-center space-x-2 text-sm text-gray-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Información actualizada en tiempo real</span>
                  </div>
                  <div class="flex space-x-3">
                    <button
                      @click="$emit('close')"
                      class="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                    >
                      Cerrar
                    </button>
                    <button
                      @click="$emit('edit', creditData); $emit('close')"
                      class="px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
import CreditCardIcon from './ui/CreditCardIcon.vue'

// Props
defineProps({
  creditData: {
    type: Object,
    default: null
  }
})

// Emits
defineEmits(['close', 'edit'])

// Utilidades
const formatCurrency = (n) => {
  const num = Number(n) || 0
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

const getCardType = (brand) => {
  if (!brand) return 'generic'
  
  const brandLower = brand.toLowerCase()
  if (brandLower.includes('visa')) return 'visa'
  if (brandLower.includes('mastercard') || brandLower.includes('master')) return 'mastercard'
  if (brandLower.includes('amex') || brandLower.includes('american express')) return 'amex'
  if (brandLower.includes('discover')) return 'discover'
  
  return 'generic'
}

const getCardGradient = (brand) => {
  if (!brand) return 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
  
  const brandLower = brand.toLowerCase()
  if (brandLower.includes('visa')) return 'bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900'
  if (brandLower.includes('mastercard') || brandLower.includes('master')) return 'bg-gradient-to-br from-red-900 via-orange-800 to-red-900'
  if (brandLower.includes('amex') || brandLower.includes('american express')) return 'bg-gradient-to-br from-blue-900 via-blue-700 to-blue-900'
  if (brandLower.includes('discover')) return 'bg-gradient-to-br from-orange-900 via-orange-800 to-orange-900'
  
  return 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
}

const getUtilizationPercentage = (balance, creditLimit) => {
  if (!creditLimit || creditLimit <= 0) return 0
  const percentage = Math.min(100, Math.max(0, ((balance || 0) / creditLimit) * 100))
  return percentage.toFixed(1)
}

const getUtilizationColor = (balance, creditLimit) => {
  const percentage = getUtilizationPercentage(balance, creditLimit)
  if (percentage >= 90) return 'text-red-600'
  if (percentage >= 70) return 'text-orange-600'
  return 'text-green-600'
}

const getUtilizationBarColor = (balance, creditLimit) => {
  const percentage = getUtilizationPercentage(balance, creditLimit)
  if (percentage >= 90) return 'bg-gradient-to-r from-red-500 to-red-600'
  if (percentage >= 70) return 'bg-gradient-to-r from-orange-500 to-orange-600'
  return 'bg-gradient-to-r from-green-500 to-green-600'
}
</script>
