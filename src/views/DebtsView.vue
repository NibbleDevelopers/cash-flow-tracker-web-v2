<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Header responsive -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
      <h2 class="text-lg sm:text-xl font-semibold text-gray-900">Créditos</h2>
      <button 
        v-if="showAddButton"
        class="btn-primary inline-flex items-center justify-center space-x-2 px-3 py-2 sm:px-4 rounded-md text-sm w-full sm:w-auto hover:scale-105 hover:shadow-lg transition-all duration-300 ease-out group" 
        @click="openCreate"
      >
        <svg class="w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span>Nuevo crédito</span>
      </button>
    </div>

    <!-- Estadísticas responsive -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" v-motion-slide-visible-once-bottom>
      <div class="card p-3 sm:p-4 hover:scale-105 hover:shadow-lg transition-all duration-300 ease-out group" v-motion :initial="{opacity:0,y:8}" :enter="{opacity:1,y:0,transition:{duration:0.25, delay:0}}">
        <div class="text-xs text-gray-500 mb-1">Total créditos</div>
        <div class="text-lg sm:text-2xl font-semibold">
          <span v-if="!loading">{{ formatCurrency(totalBalance) }}</span>
          <LoadingSkeleton v-else type="text" width="4rem" class="sm:w-6rem animate-pulse" />
        </div>
      </div>
      <div class="card p-3 sm:p-4" v-motion :initial="{opacity:0,y:8}" :enter="{opacity:1,y:0,transition:{duration:0.25, delay:0.05}}">
        <div class="text-xs text-gray-500 mb-1">Límite total</div>
        <div class="text-lg sm:text-2xl font-semibold">
          <span v-if="!loading">{{ formatCurrency(totalCreditLimit) }}</span>
          <LoadingSkeleton v-else type="text" width="4rem" class="sm:w-6rem animate-pulse" />
        </div>
      </div>
      <div class="card p-3 sm:p-4 hover:scale-105 hover:shadow-lg transition-all duration-300 ease-out group" v-motion :initial="{opacity:0,y:8}" :enter="{opacity:1,y:0,transition:{duration:0.25, delay:0.1}}">
        <div class="text-xs text-gray-500 mb-1">Utilización</div>
        <div class="text-lg sm:text-2xl font-semibold">
          <span v-if="!loading">{{ utilization.toFixed(1) }}%</span>
          <LoadingSkeleton v-else type="text" width="3rem" class="sm:w-4rem animate-pulse" />
        </div>
      </div>
      <div class="card p-3 sm:p-4 hover:scale-105 hover:shadow-lg transition-all duration-300 ease-out group" v-motion :initial="{opacity:0,y:8}" :enter="{opacity:1,y:0,transition:{duration:0.25, delay:0.15}}">
        <div class="text-xs text-gray-500 mb-1">Activas</div>
        <div class="text-lg sm:text-2xl font-semibold">
          <span v-if="!loading">{{ activeCount }}</span>
          <LoadingSkeleton v-else type="text" width="1.5rem" class="sm:w-2rem animate-pulse" />
        </div>
      </div>
    </div>

    <div class="card">
      <Transition
        enter-active-class="transition ease-out duration-500"
        enter-from-class="opacity-0 transform scale-95"
        enter-to-class="opacity-100 transform scale-100"
        leave-active-class="transition ease-in duration-300"
        leave-from-class="opacity-100 transform scale-100"
        leave-to-class="opacity-0 transform scale-95"
        mode="out-in"
      >
        <div v-if="loading" key="loading" class="animate-pulse">
        <LoadingSkeleton type="table" :rows="3" />
      </div>
        <div v-else key="content">
          <Transition
            enter-active-class="transition ease-out duration-700"
            enter-from-class="opacity-0 transform translate-y-4"
            enter-to-class="opacity-100 transform translate-y-0"
            leave-active-class="transition ease-in duration-300"
            leave-from-class="opacity-100 transform translate-y-0"
            leave-to-class="opacity-0 transform -translate-y-4"
            mode="out-in"
          >
            <div v-if="debts.length === 0" key="empty" class="text-center py-12">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Sin créditos registrados</h3>
          <p class="text-gray-500 mb-4">Comienza agregando tu primera tarjeta de crédito o préstamo</p>
              <button class="btn-primary hover:scale-105 transition-transform duration-200" @click="openCreate">Agregar primer crédito</button>
        </div>
            <div v-else key="list">
          <!-- Vista Desktop: Tabla -->
          <div class="hidden lg:block overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Emisor</th>
                <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Límite</th>
                <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Saldo</th>
                <th class="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Pago</th>
                <th class="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Corte</th>
                <th class="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Activa</th>
                <th class="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr v-for="(d, index) in debts" :key="d.id" class="hover:bg-gray-50 transition-all duration-300 ease-out hover:shadow-sm group animate-in slide-in-from-left-4 fade-in" :style="{ animationDelay: `${index * 50}ms` }">
                <td class="px-3 py-2">
                  <div class="font-medium">{{ d.name }}</div>
                  <div class="flex items-center space-x-2 text-xs text-gray-500">
                    <span v-if="d.brand" class="badge" 
                          :style="{ backgroundColor: getCardTypeColor(d.brand) + '20', color: getCardTypeColor(d.brand) }">
                      {{ d.brand }}
                    </span>
                    <span v-if="d.maskPan" class="text-gray-400">•••• {{ d.maskPan }}</span>
                  </div>
                </td>
                <td class="px-3 py-2">{{ d.issuer }}</td>
                <td class="px-3 py-2 text-right">{{ formatCurrency(d.creditLimit) }}</td>
                <td class="px-3 py-2 text-right">
                  <div class="text-right">{{ formatCurrency(d.balance) }}</div>
                  <div class="mt-1 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-primary-600"
                      :style="{ width: getUtilizationWidth(d.balance, d.creditLimit) }"
                    ></div>
                  </div>
                </td>
                <td class="px-3 py-2 text-center">{{ d.dueDay || '-' }}</td>
                <td class="px-3 py-2 text-center">{{ d.cutOffDay || '-' }}</td>
                <td class="px-3 py-2 text-center">
                  <span :class="d.active ? 'badge badge-success' : 'badge badge-gray'">{{ d.active ? 'Activa' : 'Inactiva' }}</span>
                </td>
                <td class="px-3 py-2 text-right space-x-2">
                  <span class="relative group inline-block">
                    <button class="btn-secondary inline-flex items-center justify-center hover:scale-110 hover:shadow-lg transition-all duration-300 ease-out" @click="openEdit(d)" aria-label="Editar">
                      <PencilSquareIcon class="h-5 w-5 transition-all duration-300" />
                    </button>
                    <span class="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded bg-gray-800 text-white text-[10px] opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">Editar</span>
                  </span>
                  <span class="relative group inline-block">
                    <button class="btn-secondary inline-flex items-center justify-center hover:scale-110 hover:shadow-lg transition-all duration-300 ease-out" @click="openSummary(d)" aria-label="Resumen">
                      <svg class="h-5 w-5 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <span class="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded bg-gray-800 text-white text-[10px] opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">Resumen</span>
                  </span>
                  <span class="relative group inline-block">
                    <button class="btn-secondary inline-flex items-center justify-center hover:scale-110 hover:shadow-lg transition-all duration-300 ease-out" @click="openInstallments(d)" aria-label="Cuotas">
                      <svg class="h-5 w-5 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <span class="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded bg-gray-800 text-white text-[10px] opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">Cuotas</span>
                  </span>
                  <span class="relative group inline-block">
                    <button class="inline-flex items-center justify-center p-2 rounded-md border border-gray-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 hover:scale-110 hover:shadow-lg transition-all duration-300 ease-out" @click="confirmDelete(d)" aria-label="Eliminar">
                      <TrashIcon class="h-5 w-5 transition-all duration-300" />
                    </button>
                    <span class="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded bg-gray-800 text-white text-[10px] opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">Eliminar</span>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

          <!-- Vista Mobile: Cards -->
          <div class="lg:hidden space-y-3">
            <CreditCard
              v-for="(d, index) in debts"
              :key="d.id"
              :credit="d"
              :style="{ animationDelay: `${index * 100}ms` }"
              @edit="openEdit"
              @delete="confirmDelete"
              @summary="openSummary"
              @installments="openInstallments"
            />
      </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </div>

    <TransitionRoot as="template" :show="showForm">
      <Dialog as="div" class="relative z-50" @close="closeForm">
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </TransitionChild>
        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-0 sm:p-4">
            <TransitionChild as="template" enter="ease-out duration-500" enter-from="opacity-0 translate-y-8 scale-95" enter-to="opacity-100 translate-y-0 scale-100" leave="ease-in duration-300" leave-from="opacity-100 translate-y-0 scale-100" leave-to="opacity-0 translate-y-8 scale-95">
              <DialogPanel 
                class="w-full h-full sm:w-full sm:h-auto sm:max-w-2xl transform overflow-hidden bg-white shadow-xl flex flex-col sm:flex-none"
                role="dialog"
                aria-modal="true"
                :aria-labelledby="editing ? 'edit-credit-title' : 'add-credit-title'"
                aria-describedby="credit-modal-description"
              >
                <!-- Header -->
                <div class="bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-4 sm:px-6 sm:py-4">
                  <div class="flex items-center justify-between">
                    <DialogTitle 
                      :id="editing ? 'edit-credit-title' : 'add-credit-title'" 
                      class="text-lg font-semibold text-white"
                    >
                      {{ editing ? 'Editar crédito' : 'Nuevo crédito' }}
                    </DialogTitle>
                    <button
                      type="button"
                      class="rounded-md text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
                      @click="closeForm"
                      aria-label="Cerrar modal"
                    >
                      <span class="sr-only">Cerrar</span>
                      <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Description for screen readers -->
                <div id="credit-modal-description" class="sr-only">
                  {{ editing ? 'Editar los detalles del crédito seleccionado' : 'Completar el formulario para agregar un nuevo crédito' }}
                </div>

                <!-- Form -->
                <div class="px-4 py-4 sm:px-6 sm:py-6 flex-1 overflow-y-auto sm:overflow-visible sm:flex-none">
                  <DebtForm 
                    v-model="formModel" 
                    :submit-text="editing ? 'Actualizar' : 'Crear'" 
                    :loading="loading"
                    @submit="handleSubmit" 
                    @cancel="closeForm" 
                  />
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>


    <!-- Modal de Información de Crédito -->
    <TransitionRoot as="template" :show="!!creditInfoData">
      <Dialog class="relative z-50" @close="creditInfoData = null">
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
              <DialogPanel class="relative transform overflow-hidden bg-white shadow-xl transition-all w-full max-w-2xl rounded-lg">
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
                        <h3 class="text-lg font-semibold text-white">{{ creditInfoData?.name }}</h3>
                        <p class="text-blue-100 text-sm">{{ creditInfoData?.issuer || 'Sin emisor' }}</p>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <span :class="[
                        'px-3 py-1 rounded-full text-xs font-medium',
                        creditInfoData?.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      ]">
                        {{ creditInfoData?.active ? 'Activa' : 'Inactiva' }}
                      </span>
                      <button
                        @click="creditInfoData = null"
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
                           getCardGradient(creditInfoData?.brand),
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
                              :type="getCardType(creditInfoData?.brand)" 
                              size="medium" 
                            />
                          </div>
                          <div class="text-right">
                            <div class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium uppercase"
                                 :class="creditInfoData?.active ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'">
                              <svg class="w-2 h-2 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path :fill-rule="creditInfoData?.active ? 'evenodd' : 'evenodd'" 
                                      :d="creditInfoData?.active ? 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' : 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'" 
                                      clip-rule="evenodd" />
                              </svg>
                              {{ creditInfoData?.active ? 'ACTIVA' : 'INACTIVA' }}
                            </div>
                          </div>
                        </div>

                        <!-- Card Number -->
                        <div class="text-center">
                          <p class="text-xs text-gray-300 mb-1">Número de Tarjeta</p>
                          <p class="text-lg font-mono tracking-wider">
                            {{ creditInfoData?.maskPan ? `•••• •••• •••• ${creditInfoData.maskPan}` : '•••• •••• •••• ••••' }}
                          </p>
                        </div>

                        <!-- Bottom Row -->
                        <div class="flex justify-between items-end gap-2">
                          <!-- Financial Information -->
                          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-1.5 sm:p-2 flex-1">
                            <div class="grid grid-cols-2 gap-1 mb-1 sm:mb-1.5">
                              <div>
                                <p class="text-xs text-gray-300 mb-0.5">Saldo</p>
                                <p class="text-xs font-bold">{{ formatCurrency(creditInfoData?.balance || 0) }}</p>
                              </div>
                              <div>
                                <p class="text-xs text-gray-300 mb-0.5">Límite</p>
                                <p class="text-xs font-bold">{{ formatCurrency(creditInfoData?.creditLimit || 0) }}</p>
                              </div>
                            </div>
                            
                            <!-- Credit Utilization -->
                            <div>
                              <div class="flex justify-between items-center mb-0.5 sm:mb-1">
                                <span class="text-xs text-gray-300">Utilización</span>
                                <span class="text-xs font-bold px-1 py-0.5 rounded-full"
                                      :class="getUtilizationColor(creditInfoData?.balance, creditInfoData?.creditLimit)">
                                  {{ getUtilizationPercentage(creditInfoData?.balance, creditInfoData?.creditLimit) }}%
                                </span>
                              </div>
                              <div class="h-1 bg-white/20 rounded-full overflow-hidden">
                                <div
                                  class="h-full transition-all duration-1000 ease-out rounded-full"
                                  :class="getUtilizationBarColor(creditInfoData?.balance, creditInfoData?.creditLimit)"
                                  :style="{ width: getUtilizationPercentage(creditInfoData?.balance, creditInfoData?.creditLimit) + '%' }"
                                ></div>
                              </div>
                            </div>
                          </div>

                          <!-- Card Holder and Expiry -->
                          <div class="text-right flex-shrink-0">
                            <div class="mb-1">
                              <p class="text-xs text-gray-300 mb-0.5">Titular</p>
                              <p class="text-xs font-bold">{{ creditInfoData?.brand || 'TARJETA DE CRÉDITO' }}</p>
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
                            {{ formatCurrency((creditInfoData?.creditLimit || 0) - (creditInfoData?.balance || 0)) }}
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
                            <p class="text-xs text-gray-500 mb-0.5">Corte</p>
                            <p class="text-sm font-medium text-gray-700">
                              {{ creditInfoData?.cutOffDay || 'No configurado' }}
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
                            <p class="text-xs text-gray-500 mb-0.5">Pago</p>
                            <p class="text-sm font-medium text-gray-700">
                              {{ creditInfoData?.dueDay || 'No configurado' }}
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
                        @click="creditInfoData = null"
                        class="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                      >
                        Cerrar
                      </button>
                      <button
                        @click="openEdit(creditInfoData); creditInfoData = null"
                        class="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5h2m-6 14h10a2 2 0 002-2v-5.586a1 1 0 00-.293-.707l-6.414-6.414A1 1 0 0011.586 4H6a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                        Editar Crédito
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

    <!-- Modal de Plan de Cuotas -->
    <TransitionRoot as="template" :show="!!installmentsData">
      <Dialog class="relative z-50" @close="installmentsData = null">
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity" />
        </TransitionChild>

        <div class="fixed inset-0 z-10 overflow-y-auto">
          <div class="flex min-h-full items-end justify-center p-0 text-center sm:items-center sm:p-4">
            <TransitionChild
              as="template"
              enter="ease-out duration-500"
              enter-from="opacity-0 translate-y-8 sm:translate-y-0 sm:scale-95"
              enter-to="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-300"
              leave-from="opacity-100 translate-y-0 sm:scale-100"
              leave-to="opacity-0 translate-y-8 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel class="relative transform overflow-hidden bg-white text-left shadow-xl transition-all w-full h-full sm:h-auto sm:my-8 sm:w-full sm:max-w-6xl sm:rounded-lg flex flex-col sm:flex-none">
                <!-- Header -->
                <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 flex-shrink-0">
                  <div class="flex items-center justify-between mb-4 sm:mb-6">
                    <div class="flex-1 min-w-0">
                      <DialogTitle as="h3" class="text-lg font-semibold leading-6 text-gray-900">
                        Plan de Cuotas
                      </DialogTitle>
                      <p class="text-sm text-gray-500 mt-1 truncate">{{ installmentsData?.debt?.name }}</p>
                    </div>
                    <button
                      type="button"
                      class="rounded-md bg-white text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 flex-shrink-0 ml-2"
                      @click="installmentsData = null"
                      aria-label="Cerrar modal"
                    >
                      <span class="sr-only">Cerrar</span>
                      <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <!-- Resumen del Plan -->
                  <div v-if="installmentsData?.totals" class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div class="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
                      <div class="flex items-center">
                        <div class="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                          <svg class="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <div class="min-w-0 flex-1">
                          <p class="text-xs text-blue-600 font-medium">Pago Mensual</p>
                          <p class="text-sm sm:text-lg font-bold text-blue-900 truncate">{{ formatCurrency(installmentsData.payment) }}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div class="bg-orange-50 rounded-lg p-3 sm:p-4 border border-orange-200">
                      <div class="flex items-center">
                        <div class="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                          <svg class="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div class="min-w-0 flex-1">
                          <p class="text-xs text-orange-600 font-medium">Total a Pagar</p>
                          <p class="text-sm sm:text-lg font-bold text-orange-900 truncate">{{ formatCurrency(installmentsData.totals.totalPaid) }}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div class="bg-red-50 rounded-lg p-3 sm:p-4 border border-red-200">
                      <div class="flex items-center">
                        <div class="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                          <svg class="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <div class="min-w-0 flex-1">
                          <p class="text-xs text-red-600 font-medium">Total Intereses</p>
                          <p class="text-sm sm:text-lg font-bold text-red-900 truncate">{{ formatCurrency(installmentsData.totals.totalInterest) }}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div class="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-200">
                      <div class="flex items-center">
                        <div class="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                          <svg class="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div class="min-w-0 flex-1">
                          <p class="text-xs text-green-600 font-medium">Capital</p>
                          <p class="text-sm sm:text-lg font-bold text-green-900 truncate">{{ formatCurrency(installmentsData.totals.totalPrincipal) }}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Información de fechas recomendadas -->
                  <div v-if="installmentsData?.debt" class="mb-4 p-3 rounded-lg border" 
                       :class="(installmentsData.debt.dueDay && installmentsData.debt.cutOffDay && installmentsData.debt.dueDay > 0 && installmentsData.debt.cutOffDay > 0)
                         ? 'bg-blue-50 border-blue-200' 
                         : 'bg-yellow-50 border-yellow-200'"
                       @click="void 0">
                    <div class="flex items-start space-x-2">
                      <svg v-if="installmentsData.debt.dueDay && installmentsData.debt.cutOffDay && installmentsData.debt.dueDay > 0 && installmentsData.debt.cutOffDay > 0" 
                           class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <svg v-else class="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div>
                        <h4 class="text-sm font-medium" 
                            :class="(installmentsData.debt.dueDay && installmentsData.debt.cutOffDay && installmentsData.debt.dueDay > 0 && installmentsData.debt.cutOffDay > 0)
                              ? 'text-blue-900' 
                              : 'text-yellow-900'">
                          {{ (installmentsData.debt.dueDay && installmentsData.debt.cutOffDay && installmentsData.debt.dueDay > 0 && installmentsData.debt.cutOffDay > 0)
                             ? 'Fechas de Pago Recomendadas' 
                             : 'Configuración Requerida' }}
                        </h4>
                        <p class="text-xs mt-1"
                           :class="(installmentsData.debt.dueDay && installmentsData.debt.cutOffDay && installmentsData.debt.dueDay > 0 && installmentsData.debt.cutOffDay > 0)
                             ? 'text-blue-700' 
                             : 'text-yellow-700'">
                          Día de vencimiento: {{ (installmentsData.debt.dueDay && installmentsData.debt.dueDay > 0) ? installmentsData.debt.dueDay : 'No configurado' }} | 
                          Día de corte: {{ (installmentsData.debt.cutOffDay && installmentsData.debt.cutOffDay > 0) ? installmentsData.debt.cutOffDay : 'No configurado' }}
                        </p>
                        <p class="text-xs mt-1"
                           :class="(installmentsData.debt.dueDay && installmentsData.debt.cutOffDay && installmentsData.debt.dueDay > 0 && installmentsData.debt.cutOffDay > 0)
                             ? 'text-blue-600' 
                             : 'text-yellow-600'">
                          {{ (installmentsData.debt.dueDay && installmentsData.debt.cutOffDay && installmentsData.debt.dueDay > 0 && installmentsData.debt.cutOffDay > 0)
                             ? 'Las fechas se calcularán automáticamente basándose en estos días para optimizar tus pagos.'
                             : 'Debes configurar los días de vencimiento y corte para generar fechas de pago óptimas.' }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Controles -->
                  <div class="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between mb-4">
                    <div class="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
                      <div class="flex items-center space-x-2">
                        <label class="text-sm font-medium text-gray-700">Duración:</label>
                        <input 
                          v-model.number="installmentMonths" 
                          type="number" 
                          min="1" 
                          max="48" 
                          class="input-field w-16 sm:w-20 h-8 text-center" 
                        />
                        <span class="text-sm text-gray-500">meses</span>
                      </div>
                      <div class="flex items-center space-x-2">
                        <input id="biweeklyToggle" v-model="biweeklyPayments" type="checkbox" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                        <label for="biweeklyToggle" class="text-sm font-medium text-gray-700">Pagos quincenales</label>
                      </div>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:items-center sm:space-x-2">
                      <button class="btn-primary px-3 py-2 text-sm inline-flex items-center justify-center" @click="reloadInstallments">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span class="hidden sm:inline">Generar Plan</span>
                        <span class="sm:hidden">Generar</span>
                      </button>
                      <button 
                        v-if="installmentsData?.schedule?.length > 0"
                        class="btn-secondary px-3 py-2 text-sm inline-flex items-center justify-center" 
                        @click="createExpensesFromInstallments"
                        :disabled="creatingExpenses || !installmentsData?.debt?.dueDay || !installmentsData?.debt?.cutOffDay || installmentsData?.debt?.dueDay === 0 || installmentsData?.debt?.cutOffDay === 0"
                        :title="(!installmentsData?.debt?.dueDay || !installmentsData?.debt?.cutOffDay || installmentsData?.debt?.dueDay === 0 || installmentsData?.debt?.cutOffDay === 0) ? 'Configura primero los días de vencimiento y corte' : ''"
                      >
                        <svg v-if="creatingExpenses" class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span class="hidden sm:inline">{{ creatingExpenses ? 'Creando...' : (biweeklyPayments ? 'Crear Gastos Quincenales' : 'Crear Gastos Automáticos') }}</span>
                        <span class="sm:hidden">{{ creatingExpenses ? 'Creando...' : 'Crear' }}</span>
                      </button>
                    </div>
                    <div class="text-sm text-gray-500 text-center sm:text-right">
                      Mostrando {{ installmentsData?.schedule?.length || 0 }} cuotas
                    </div>
                  </div>
                </div>

                <!-- Tabla de Cuotas -->
                <div class="bg-gray-50 px-4 py-3 sm:px-6 flex-1 overflow-hidden">
                  <div class="overflow-x-auto h-full max-h-64 sm:max-h-96">
                    <table class="min-w-full divide-y divide-gray-200">
                      <thead class="bg-gray-100 sticky top-0">
                        <tr>
                          <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                          <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                          <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pago</th>
                          <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Interés</th>
                          <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Capital</th>
                          <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo</th>
                        </tr>
                      </thead>
                      <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="(row, index) in installmentsData?.schedule" :key="row.period" 
                            :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'">
                          <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                            {{ row.period }}
                          </td>
                          <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            <div v-if="!biweeklyPayments">
                              {{ calculatedInstallmentDates?.[index]?.displayDate || row.date }}
                            </div>
                            <div v-else class="space-y-1">
                              <div>
                                <span class="inline-block px-1.5 py-0.5 rounded bg-gray-100 mr-1 text-gray-700">1/2</span>
                                <span>{{ getBiweeklyForRow(index)?.display[0] }}</span>
                              </div>
                              <div>
                                <span class="inline-block px-1.5 py-0.5 rounded bg-gray-100 mr-1 text-gray-700">2/2</span>
                                <span>{{ getBiweeklyForRow(index)?.display[1] }}</span>
                              </div>
                            </div>
                          </td>
                          <td class="px-3 py-2 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                            <div v-if="!biweeklyPayments">
                              {{ formatCurrency(row.payment) }}
                            </div>
                            <div v-else class="space-y-1 text-right">
                              <div>
                                <span class="inline-block px-1.5 py-0.5 rounded bg-gray-100 mr-1 text-gray-700">1/2</span>
                                <span>{{ formatCurrency(getBiweeklyAmountsForRow(index).first) }}</span>
                              </div>
                              <div>
                                <span class="inline-block px-1.5 py-0.5 rounded bg-gray-100 mr-1 text-gray-700">2/2</span>
                                <span>{{ formatCurrency(getBiweeklyAmountsForRow(index).second) }}</span>
                              </div>
                            </div>
                          </td>
                          <td class="px-3 py-2 whitespace-nowrap text-sm text-right text-red-600">
                            {{ formatCurrency(row.interest) }}
                          </td>
                          <td class="px-3 py-2 whitespace-nowrap text-sm text-right text-green-600">
                            {{ formatCurrency(row.principal) }}
                          </td>
                          <td class="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-500">
                            {{ formatCurrency(row.remainingBalance) }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Footer -->
                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse flex-shrink-0">
                  <button
                    type="button"
                    class="btn-secondary w-full sm:w-auto sm:ml-3"
                    @click="installmentsData = null"
                    aria-label="Cerrar modal de plan de cuotas"
                  >
                    Cerrar
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Botón flotante para mobile -->
    <Teleport to="body">
      <div class="fixed bottom-20 right-4 sm:hidden z-40">
        <!-- Menú de acciones rápidas -->
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="transform opacity-0 scale-95"
          enter-to-class="transform opacity-100 scale-100"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="transform opacity-100 scale-100"
          leave-to-class="transform opacity-0 scale-95"
        >
          <div
            v-if="showQuickActions"
            class="absolute bottom-16 right-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2"
          >
            <button
              @click="openAddCredit"
              class="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
            >
              <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <div class="font-medium">Nuevo crédito</div>
                <div class="text-xs text-gray-500">Agregar tarjeta o préstamo</div>
              </div>
            </button>
          </div>
        </Transition>

        <!-- Botón principal flotante -->
        <button
          @click="toggleQuickActions"
          class="w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary-200"
          :class="{ 'rotate-45': showQuickActions }"
          aria-label="Acciones rápidas"
        >
          <svg class="w-6 h-6 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, Teleport, Transition } from 'vue'
import { useDebtStore } from '../stores/debtStore'
import { useExpenseStore } from '../stores/expenseStore'
import { useConfirm } from '../composables/useConfirm'
import { storeToRefs } from 'pinia'
import DebtForm from '../components/DebtForm.vue'
import CreditCard from '../components/CreditCard.vue'
import CreditCardIcon from '../components/ui/CreditCardIcon.vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { PencilSquareIcon, InformationCircleIcon, CalendarDaysIcon, TrashIcon } from '@heroicons/vue/24/outline'
import LoadingSkeleton from '../components/ui/LoadingSkeleton.vue'
import { notify } from '../services/notifications.js'
import { format, endOfMonth } from 'date-fns'

const debtStore = useDebtStore()
const expenseStore = useExpenseStore()
const confirm = useConfirm()
const { debts, loading, totalBalance, totalCreditLimit, utilizationRate, activeDebts } = storeToRefs(debtStore)

// Estado local del componente
const showForm = ref(false)
const editing = ref(false)
const formModel = ref({})
const installmentsData = ref(null)
const creditInfoData = ref(null)
const calculatedInstallmentDates = ref(null)
const installmentMonths = ref(6)
const creatingExpenses = ref(false)
const biweeklyPayments = ref(false)

// Botón flotante para mobile
const showQuickActions = ref(false)
const showAddButton = ref(true)

// Computed para UI
const activeCount = computed(() => activeDebts.value.length)
const utilization = computed(() => utilizationRate.value)

// Utilidades
const formatCurrency = (n) => {
  const num = Number(n) || 0
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

const getUtilizationWidth = (balance, creditLimit) => {
  if (!creditLimit || creditLimit <= 0) return '0%'
  const percentage = Math.min(100, Math.max(0, ((balance || 0) / creditLimit) * 100))
  return `${percentage.toFixed(1)}%`
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


const getStatusBadgeClass = (active) => {
  return active 
    ? 'text-green-700 bg-green-50' 
    : 'text-gray-600 bg-gray-100'
}

const getCardTypeColor = (brand) => {
  const colors = {
    'Visa': '#1A1F71',
    'Mastercard': '#EB001B',
    'American Express': '#006FCF',
    'Discover': '#FF6000',
    'Diners Club': '#0079BE',
    'JCB': '#003B7C'
  }
  return colors[brand] || '#6B7280'
}


// Bloquear scroll cuando el modal esté abierto
watch(showForm, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// Limpiar scroll al desmontar el componente
onUnmounted(() => {
  document.body.style.overflow = ''
})

const openCreate = () => {
  editing.value = false
  formModel.value = {}
  showForm.value = true
}

const openEdit = (debt) => {
  editing.value = true
  formModel.value = { ...debt }
  showForm.value = true
}

const closeForm = () => { showForm.value = false }

// Funciones del botón flotante
const toggleQuickActions = () => {
  showQuickActions.value = !showQuickActions.value
}

const openAddCredit = () => {
  showQuickActions.value = false
  openCreate()
}

// Actualizar visibilidad del botón según el tamaño de pantalla
const updateScreenSize = () => {
  showAddButton.value = window.innerWidth >= 640
}

onMounted(async () => {
  if (!debts.value?.length) await debtStore.loadDebts()
  if (!expenseStore.categories?.length) await expenseStore.loadCategories()
  
  // Configurar visibilidad del botón
  updateScreenSize()
  window.addEventListener('resize', updateScreenSize)
})

onUnmounted(() => {
  document.body.style.overflow = ''
  window.removeEventListener('resize', updateScreenSize)
})

const handleSubmit = async (payload) => {
  if (editing.value && payload.id) {
    await debtStore.updateDebt(payload.id, payload)
  } else {
    await debtStore.createDebt(payload)
  }
  showForm.value = false
}

const confirmDelete = async (debt) => {
  const ok = await confirm.show({
    title: 'Eliminar deuda',
    message: `¿Eliminar deuda "${debt.name}"?`,
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    variant: 'danger'
  })
  if (!ok) return
  await debtStore.deleteDebt(debt.id)
}

const openSummary = async (debt) => {
  creditInfoData.value = debt
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

const openInstallments = async (debt) => {
  try {
    // Validar parámetros de entrada
    if (!debt?.id) {
      notify.error('Datos de deuda inválidos')
      return
    }

    // Validar y ajustar número de meses
    const months = Math.min(Math.max(installmentMonths.value, 1), 48)
    installmentMonths.value = months

    // Cargar datos de cuotas
    installmentsData.value = await debtStore.fetchDebtInstallments(debt.id, { months })
    
    if (!installmentsData.value?.debt) {
      notify.error('Error al cargar los datos de cuotas')
      return
    }

    // Aplicar datos faltantes del backend (solución temporal)
    applyMissingDebtData(installmentsData.value.debt, debt)
    
    // Calcular fechas recomendadas para el modal
    await calculateInstallmentDatesForModal()
    
  } catch (error) {
    console.error('Error abriendo cuotas:', error)
    notify.error('Error al abrir el plan de cuotas')
  }
}

/**
 * Aplica datos faltantes de la deuda desde la lista principal
 * @param {Object} installmentDebt - Datos de deuda del endpoint de cuotas
 * @param {Object} originalDebt - Datos originales de la deuda
 */
const applyMissingDebtData = (installmentDebt, originalDebt) => {
  if (!installmentDebt.dueDay && originalDebt.dueDay) {
    installmentDebt.dueDay = originalDebt.dueDay
  }
  if (!installmentDebt.cutOffDay && originalDebt.cutOffDay) {
    installmentDebt.cutOffDay = originalDebt.cutOffDay
  }
}

/**
 * Calcula las fechas de cuotas para mostrar en el modal
 */
const calculateInstallmentDatesForModal = async () => {
  if (!installmentsData.value?.schedule?.length || !installmentsData.value?.debt) {
    calculatedInstallmentDates.value = null
    return
  }

  try {
    const { calculateRecommendedPaymentDate, calculateInstallmentDates } = await import('../utils/installmentDates.js')
    const { dueDay, cutOffDay } = installmentsData.value.debt
    
    if (!dueDay || !cutOffDay) {
      notify.warning('No se pueden calcular fechas: dueDay o cutOffDay no están configurados')
      calculatedInstallmentDates.value = null
      return
    }

    const recommendedDate = calculateRecommendedPaymentDate(dueDay, cutOffDay)
    calculatedInstallmentDates.value = calculateInstallmentDates(
      dueDay, 
      cutOffDay, 
      installmentsData.value.schedule.length, 
      recommendedDate.date
    )
  } catch (error) {
    console.error('Error calculando fechas de cuotas:', error)
    calculatedInstallmentDates.value = null
  }
}

const reloadInstallments = async () => {
  if (!installmentsData.value?.debt?.id) {
    return
  }

  try {
    // Guardar datos originales antes de recargar
    const originalDebt = installmentsData.value.debt
    
    // Validar y ajustar número de meses
    const months = Math.min(Math.max(installmentMonths.value, 1), 48)
    installmentMonths.value = months

    // Recargar datos de cuotas
    installmentsData.value = await debtStore.fetchDebtInstallments(installmentsData.value.debt.id, { months })
    
    if (!installmentsData.value?.debt) {
      notify.error('Error al recargar los datos de cuotas')
      return
    }

    // Aplicar datos faltantes del backend (solución temporal)
    applyMissingDebtData(installmentsData.value.debt, originalDebt)
    
    // Recalcular fechas recomendadas
    await calculateInstallmentDatesForModal()
    
  } catch (error) {
    console.error('Error recargando cuotas:', error)
    notify.error('Error al recargar el plan de cuotas')
  }
}

const createExpensesFromInstallments = async () => {
  if (!installmentsData.value?.schedule?.length || !installmentsData.value?.debt) {
    notify.info('No hay datos de cuotas o deuda para procesar')
    return
  }

  creatingExpenses.value = true
  
  try {
    // Asegurar categoría de crédito
    const creditCategory = await ensureCreditPaymentCategory()
    
    const debt = installmentsData.value.debt
    const paymentAmount = installmentsData.value.payment
    
    // Verificar si los días están configurados (son números del 1 al 31)
    const isDueDayValid = debt.dueDay !== null && debt.dueDay !== undefined && debt.dueDay > 0
    const isCutOffDayValid = debt.cutOffDay !== null && debt.cutOffDay !== undefined && debt.cutOffDay > 0
    
    if (!isDueDayValid || !isCutOffDayValid) {
      notify.warning(
        `La tarjeta "${debt.name}" no tiene configurados los días de vencimiento y corte.\n\n` +
        `Por favor, edita la tarjeta y configura:\n` +
        `• Día de vencimiento (ej: 15)\n` +
        `• Día de corte (ej: 25)\n\n` +
        `Esto es necesario para calcular las fechas óptimas de pago.`,
        'Configuración Requerida'
      )
      return
    }
    
    const dueDay = debt.dueDay
    const cutOffDay = debt.cutOffDay
    
    // Calcular la fecha recomendada para el primer pago
    const { calculateRecommendedPaymentDate } = await import('../utils/installmentDates.js')
    const recommendedDate = calculateRecommendedPaymentDate(dueDay, cutOffDay)
    
    // Verificar si ya existe un gasto fijo para esta deuda
    const existingFixedExpense = expenseStore.fixedExpenses.find(fe => 
      fe.name === `Pago ${debt.name}` && fe.categoryId === creditCategory.id
    )
    
    // Variable para contar gastos eliminados
    let deletedExpensesCount = 0
    
    // Si existe un gasto fijo anterior, confirmarlo y eliminar SOLO el fijo (API hace cascada)
    if (existingFixedExpense) {
      const confirmReplace = await confirm.show({
        title: 'Reemplazar Plan de Cuotas',
        message: `Ya existe un plan de cuotas para "${debt.name}".\n\n¿Deseas reemplazarlo con el nuevo plan de ${installmentsData.value.schedule?.length ?? installmentMonths.value} cuotas?\n\nSe eliminará el gasto fijo anterior y las cuotas serán removidas automáticamente.`,
        confirmText: 'Reemplazar',
        cancelText: 'Cancelar',
        variant: 'warning'
      })
      
      if (!confirmReplace) {
        return
      }
      
      // Eliminar el gasto fijo anterior (API elimina cuotas en cascada)
      await expenseStore.deleteFixedExpense(existingFixedExpense.id)
    }
    
    // Crear un gasto fijo para el pago mensual del crédito usando la fecha recomendada
    const fixedExpenseData = {
      name: `Pago ${debt.name}`,
      amount: paymentAmount,
      categoryId: creditCategory.id,
      dayOfMonth: recommendedDate.date.getDate(), // Usar el día de la fecha recomendada
      active: true
    }
    
    // Crear el gasto fijo primero
    const createdFixedExpense = await expenseStore.addFixedExpense(fixedExpenseData)
    
      // Crear gastos individuales para cada cuota del plan actual usando fechas calculadas
    const { calculateInstallmentDates } = await import('../utils/installmentDates.js')
    const calculatedDates = calculateInstallmentDates(dueDay, cutOffDay, installmentsData.value.schedule.length, recommendedDate.date)
    
    // Preparar todos los gastos para enviar en batch
    const expensesToCreate = installmentsData.value.schedule.flatMap((installment, index) => {
      const calculatedDate = calculatedDates[index]
      if (!calculatedDate) {
        throw new Error(`No hay fecha calculada para cuota ${index + 1}`)
      }

      if (!biweeklyPayments.value) {
        return [{
          date: calculatedDate.date,
          description: `Cuota ${installment.period} - ${debt.name}`,
          amount: installment.payment,
          categoryId: creditCategory.id,
          isFixed: true,
          entryType: 'payment',
          status: 'pending',
          debtId: debt.id,
          fixedExpenseId: createdFixedExpense.id
        }]
      }

      // Dividir en 2 pagos (15 y fin de mes de la cuota)
      const { first, second } = getLocalBiweeklyDates(calculatedDate.date)

      const total = Number(installment.payment) || 0
      const firstAmount = Math.round((total / 2) * 100) / 100
      const secondAmount = Math.round((total - firstAmount) * 100) / 100

      return [
        {
          date: first,
          description: `Cuota ${installment.period} (1/2) - ${debt.name}`,
          amount: firstAmount,
          categoryId: creditCategory.id,
          isFixed: true,
          entryType: 'payment',
          status: 'pending',
          debtId: debt.id,
          fixedExpenseId: createdFixedExpense.id
        },
        {
          date: second,
          description: `Cuota ${installment.period} (2/2) - ${debt.name}`,
          amount: secondAmount,
          categoryId: creditCategory.id,
          isFixed: true,
          entryType: 'payment',
          status: 'pending',
          debtId: debt.id,
          fixedExpenseId: createdFixedExpense.id
        }
      ]
    })
    
    // Crear todos los gastos de una vez usando el endpoint batch
    const expensesCreated = await expenseStore.addExpensesBatch(expensesToCreate)
    
    const action = existingFixedExpense ? 'actualizado' : 'creado'
    // Contabilizar cantidad creada de forma robusta
    const createdCount = Array.isArray(expensesCreated)
      ? expensesCreated.length
      : (typeof expensesCreated?.count === 'number'
          ? expensesCreated.count
          : (installmentsData.value?.schedule?.length ?? expensesToCreate.length))

    const replacementMessage = existingFixedExpense 
      ? `Se reemplazó el plan anterior y se crearon ${createdCount} nuevas cuotas.`
      : 'Se creó un gasto fijo para futuros pagos automáticos.'
    
    const title = `Plan de Cuotas ${action.charAt(0).toUpperCase() + action.slice(1)} para "${debt.name}"`
    const details = [
      `${createdCount} cuotas programadas`,
      `Fecha recomendada: ${recommendedDate.explanation}`,
      replacementMessage
    ].join(' · ')

    // Cerrar el modal y mostrar dos notificaciones: éxito breve + info con detalles
    installmentsData.value = null
    notify.success('Operación completada correctamente', title)
    notify.info(details, 'Detalles del Plan de Cuotas')
          
  } catch (error) {
    console.error('Error creando gastos desde cuotas:', error)
    installmentsData.value = null
    notify.error(`Error al crear los gastos automáticos: ${error.message}`)
  } finally {
    creatingExpenses.value = false
  }
}
// Obtener fechas quincenales por fila para la vista previa
const getBiweeklyForRow = (index) => {
  const row = calculatedInstallmentDates.value?.[index]
  if (!row) return { display: ['', ''] }
  const quotaDate = row?.date
  if (!quotaDate) return { display: ['', ''] }
  const { display } = getLocalBiweeklyDates(quotaDate)
  return { display }
}

// Helper local para fechas quincenales 15/fin o fin/15 siguiente
function getLocalBiweeklyDates(baseDate) {
  const refDate = new Date((typeof baseDate === 'string' ? baseDate : baseDate?.toISOString()?.slice(0,10)) + 'T00:00:00')
  const year = refDate.getFullYear()
  const month = refDate.getMonth()
  const lastOfMonth = new Date(year, month + 1, 0)
  const fifteenth = new Date(year, month, 15)
  const firstDate = fifteenth
  const secondDate = lastOfMonth

  const pad = (n) => String(n).padStart(2, '0')
  const toYmd = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
  const toDisplay = (d) => `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`

  return {
    first: toYmd(firstDate),
    second: toYmd(secondDate),
    display: [toDisplay(firstDate), toDisplay(secondDate)]
  }
}

// Montos quincenales (50/50 con ajuste de centavos en el segundo)
function getBiweeklyAmountsForRow(index) {
  const installment = installmentsData.value?.schedule?.[index]
  const total = Number(installment?.payment) || 0
  const first = Math.round((total / 2) * 100) / 100
  const second = Math.round((total - first) * 100) / 100
  return { first, second }
}

/**
 * Elimina gastos existentes relacionados con un crédito
 * @param {string} debtName - Nombre de la deuda
 * @param {number} categoryId - ID de la categoría de crédito
 * @param {number} fixedExpenseId - ID del gasto fijo
 * @returns {number} - Número de gastos eliminados
 */
// Ya no se usa: la API elimina en cascada al borrar el gasto fijo

/**
 * Asegura que existe una categoría de crédito para los pagos
 * @returns {Object} - Categoría de crédito
 * @throws {Error} - Si no se encuentra la categoría
 */
const ensureCreditPaymentCategory = async () => {
  const creditCategory = expenseStore.categories.find(cat => 
    cat.name.toLowerCase() === 'crédito' || cat.name.toLowerCase() === 'credito'
  )
  
  if (!creditCategory) {
    console.warn(
      'Por favor, crea primero una categoría llamada "Crédito" en la sección de gastos.\n\nUna vez creada, podrás usar esta funcionalidad para generar gastos automáticos.',
      'Categoría Requerida'
    )
    throw new Error('Categoría "Crédito" no encontrada')
  }
  
  return creditCategory
}
</script>