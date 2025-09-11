<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">Créditos</h2>
      <button class="btn-primary" @click="openCreate">Nuevo crédito</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="card">
        <div class="text-xs text-gray-500">Total créditos</div>
        <div class="text-2xl font-semibold">
          <span v-if="!loading">{{ formatCurrency(totalBalance) }}</span>
          <LoadingSkeleton v-else type="text" width="6rem" />
        </div>
      </div>
      <div class="card">
        <div class="text-xs text-gray-500">Límite total</div>
        <div class="text-2xl font-semibold">
          <span v-if="!loading">{{ formatCurrency(totalCreditLimit) }}</span>
          <LoadingSkeleton v-else type="text" width="6rem" />
        </div>
      </div>
      <div class="card">
        <div class="text-xs text-gray-500">Utilización</div>
        <div class="text-2xl font-semibold">
          <span v-if="!loading">{{ utilization.toFixed(1) }}%</span>
          <LoadingSkeleton v-else type="text" width="4rem" />
        </div>
      </div>
      <div class="card">
        <div class="text-xs text-gray-500">Activas</div>
        <div class="text-2xl font-semibold">
          <span v-if="!loading">{{ activeCount }}</span>
          <LoadingSkeleton v-else type="text" width="2rem" />
        </div>
      </div>
    </div>

    <div class="card">
      <div v-if="loading">
        <LoadingSkeleton type="table" :rows="3" />
      </div>
      <div v-else>
        <div v-if="debts.length === 0" class="text-center py-12">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Sin créditos registrados</h3>
          <p class="text-gray-500 mb-4">Comienza agregando tu primera tarjeta de crédito o préstamo</p>
          <button class="btn-primary" @click="openCreate">Agregar primer crédito</button>
        </div>
        <div v-else class="overflow-x-auto">
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
              <tr v-for="d in debts" :key="d.id">
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
                  <button class="btn-secondary inline-flex items-center justify-center" @click="openEdit(d)" title="Editar" aria-label="Editar">
                    <PencilSquareIcon class="h-5 w-5" />
                  </button>
                  <button class="btn-secondary inline-flex items-center justify-center" @click="openSummary(d)" title="Resumen" aria-label="Resumen">
                    <ChartBarIcon class="h-5 w-5" />
                  </button>
                  <button class="btn-secondary inline-flex items-center justify-center" @click="openInstallments(d)" title="Cuotas" aria-label="Cuotas">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </button>
                  <button class="btn-secondary inline-flex items-center justify-center" @click="confirmDelete(d)" title="Eliminar" aria-label="Eliminar">
                    <TrashIcon class="h-5 w-5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <TransitionRoot as="template" :show="showForm">
      <Dialog as="div" class="relative z-10" @close="closeForm">
        <TransitionChild as="template" enter="ease-out duration-200" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-150" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-black/30" />
        </TransitionChild>
        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild as="template" enter="ease-out duration-200" enter-from="opacity-0 translate-y-2" enter-to="opacity-100 translate-y-0" leave="ease-in duration-150" leave-from="opacity-100 translate-y-0" leave-to="opacity-0 translate-y-2">
              <DialogPanel class="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white p-6 shadow-xl">
                <DialogTitle class="text-lg font-semibold mb-4">{{ editing ? 'Editar deuda' : 'Nueva deuda' }}</DialogTitle>
                <DebtForm 
                  v-model="formModel" 
                  :submit-text="editing ? 'Actualizar' : 'Crear'" 
                  :loading="loading"
                  @submit="handleSubmit" 
                  @cancel="closeForm" 
                />
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <div v-if="summaryData" class="card">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-lg font-medium">Resumen: {{ summaryData?.debt?.name }}</h3>
        <button class="btn-secondary" @click="summaryData = null">Cerrar</button>
      </div>
      <dl class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><dt class="text-xs text-gray-500">Tasa mensual</dt><dd class="text-sm">{{ (summaryData.summary?.monthlyRate * 100).toFixed(2) }}%</dd></div>
        <div><dt class="text-xs text-gray-500">Interés este mes</dt><dd class="text-sm">{{ formatCurrency(summaryData.summary?.interestThisMonth) }}</dd></div>
        <div><dt class="text-xs text-gray-500">Pago mínimo sugerido</dt><dd class="text-sm">{{ formatCurrency(summaryData.summary?.suggestedMinimumPayment) }}</dd></div>
        <div><dt class="text-xs text-gray-500">Utilización</dt><dd class="text-sm">{{ (summaryData.summary?.utilizationPercent || 0).toFixed(1) }}%</dd></div>
        <div><dt class="text-xs text-gray-500">Próx. pago</dt><dd class="text-sm">{{ summaryData.summary?.nextDueDate }}</dd></div>
        <div><dt class="text-xs text-gray-500">Días para pago</dt><dd class="text-sm">{{ summaryData.summary?.daysToDue }}</dd></div>
      </dl>
    </div>

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
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </TransitionChild>

        <div class="fixed inset-0 z-10 overflow-y-auto">
          <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <TransitionChild
              as="template"
              enter="ease-out duration-300"
              enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enter-to="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leave-from="opacity-100 translate-y-0 sm:scale-100"
              leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-6xl">
                <!-- Header -->
                <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div class="flex items-center justify-between mb-6">
                    <div>
                      <DialogTitle as="h3" class="text-lg font-semibold leading-6 text-gray-900">
                        Plan de Cuotas
                      </DialogTitle>
                      <p class="text-sm text-gray-500 mt-1">{{ installmentsData?.debt?.name }}</p>
                    </div>
                    <button
                      type="button"
                      class="rounded-md bg-white text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      @click="installmentsData = null"
                    >
                      <span class="sr-only">Cerrar</span>
                      <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <!-- Resumen del Plan -->
                  <div v-if="installmentsData?.totals" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div class="flex items-center">
                        <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <div>
                          <p class="text-xs text-blue-600 font-medium">Pago Mensual</p>
                          <p class="text-lg font-bold text-blue-900">{{ formatCurrency(installmentsData.payment) }}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div class="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <div class="flex items-center">
                        <div class="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <p class="text-xs text-orange-600 font-medium">Total a Pagar</p>
                          <p class="text-lg font-bold text-orange-900">{{ formatCurrency(installmentsData.totals.totalPaid) }}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div class="bg-red-50 rounded-lg p-4 border border-red-200">
                      <div class="flex items-center">
                        <div class="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <div>
                          <p class="text-xs text-red-600 font-medium">Total Intereses</p>
                          <p class="text-lg font-bold text-red-900">{{ formatCurrency(installmentsData.totals.totalInterest) }}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div class="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div class="flex items-center">
                        <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p class="text-xs text-green-600 font-medium">Capital</p>
                          <p class="text-lg font-bold text-green-900">{{ formatCurrency(installmentsData.totals.totalPrincipal) }}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Información de fechas recomendadas -->
                  <div v-if="installmentsData?.debt" class="mb-4 p-3 rounded-lg border" 
                       :class="(installmentsData.debt.dueDay && installmentsData.debt.cutOffDay && installmentsData.debt.dueDay > 0 && installmentsData.debt.cutOffDay > 0)
                         ? 'bg-blue-50 border-blue-200' 
                         : 'bg-yellow-50 border-yellow-200'"
                       @click="console.log('Panel info - Valores:', { dueDay: installmentsData.debt.dueDay, cutOffDay: installmentsData.debt.cutOffDay, type: typeof installmentsData.debt.dueDay })">
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
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-4">
                      <div class="flex items-center space-x-2">
                        <label class="text-sm font-medium text-gray-700">Duración:</label>
                        <input 
                          v-model.number="installmentMonths" 
                          type="number" 
                          min="1" 
                          max="48" 
                          class="input-field w-20 h-8 text-center" 
                        />
                        <span class="text-sm text-gray-500">meses</span>
                      </div>
                      <button class="btn-primary px-4 py-2 text-sm inline-flex items-center" @click="reloadInstallments">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Generar Plan
                      </button>
                      <button 
                        v-if="installmentsData?.schedule?.length > 0"
                        class="btn-secondary px-4 py-2 text-sm inline-flex items-center" 
                        @click="createExpensesFromInstallments"
                        :disabled="creatingExpenses || !installmentsData?.debt?.dueDay || !installmentsData?.debt?.cutOffDay || installmentsData?.debt?.dueDay === 0 || installmentsData?.debt?.cutOffDay === 0"
                        :title="(!installmentsData?.debt?.dueDay || !installmentsData?.debt?.cutOffDay || installmentsData?.debt?.dueDay === 0 || installmentsData?.debt?.cutOffDay === 0) ? 'Configura primero los días de vencimiento y corte' : ''"
                      >
                        <svg v-if="creatingExpenses" class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        {{ creatingExpenses ? 'Creando...' : 'Crear Gastos Automáticos' }}
                      </button>
                    </div>
                    <div class="text-sm text-gray-500">
                      Mostrando {{ installmentsData?.schedule?.length || 0 }} cuotas
                    </div>
                  </div>
                </div>

                <!-- Tabla de Cuotas -->
                <div class="bg-gray-50 px-4 py-3 sm:px-6">
                  <div class="overflow-x-auto max-h-96">
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
                            {{ calculatedInstallmentDates?.[index]?.displayDate || row.date }}
                          </td>
                          <td class="px-3 py-2 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                            {{ formatCurrency(row.payment) }}
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
                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    class="btn-secondary w-full sm:w-auto sm:ml-3"
                    @click="installmentsData = null"
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useDebtStore } from '../stores/debtStore'
import { useExpenseStore } from '../stores/expenseStore'
import { useConfirm } from '../composables/useConfirm'
import { storeToRefs } from 'pinia'
import DebtForm from '../components/DebtForm.vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { PencilSquareIcon, ChartBarIcon, CalendarDaysIcon, TrashIcon } from '@heroicons/vue/24/outline'
import LoadingSkeleton from '../components/ui/LoadingSkeleton.vue'

const debtStore = useDebtStore()
const expenseStore = useExpenseStore()
const confirm = useConfirm()
const { debts, loading, totalBalance, totalCreditLimit, utilizationRate, activeDebts } = storeToRefs(debtStore)

// Estado local del componente
const showForm = ref(false)
const editing = ref(false)
const formModel = ref({})
const summaryData = ref(null)
const installmentsData = ref(null)
const calculatedInstallmentDates = ref(null)
const installmentMonths = ref(6)
const creatingExpenses = ref(false)

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

onMounted(async () => {
  if (!debts.value?.length) await debtStore.loadDebts()
  if (!expenseStore.categories?.length) await expenseStore.loadCategories()
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

const handleSubmit = async (payload) => {
  if (editing.value && payload.id) {
    await debtStore.updateDebt(payload.id, payload)
  } else {
    await debtStore.createDebt(payload)
  }
  showForm.value = false
}

const confirmDelete = async (debt) => {
  if (confirm(`¿Eliminar deuda "${debt.name}"?`)) {
    await debtStore.deleteDebt(debt.id)
  }
}

const openSummary = async (debt) => {
  summaryData.value = await debtStore.fetchDebtSummary(debt.id)
}

const openInstallments = async (debt) => {
  try {
    // Validar parámetros de entrada
    if (!debt?.id) {
      console.error('Error: Datos de deuda inválidos')
      return
    }

    // Validar y ajustar número de meses
    const months = Math.min(Math.max(installmentMonths.value, 1), 48)
    installmentMonths.value = months

    // Cargar datos de cuotas
    installmentsData.value = await debtStore.fetchDebtInstallments(debt.id, { months })
    
    if (!installmentsData.value?.debt) {
      console.error('Error al cargar los datos de cuotas')
      return
    }

    // Aplicar datos faltantes del backend (solución temporal)
    applyMissingDebtData(installmentsData.value.debt, debt)
    
    // Calcular fechas recomendadas para el modal
    await calculateInstallmentDatesForModal()
    
  } catch (error) {
    console.error('Error abriendo cuotas:', error)
    console.error('Error al abrir el plan de cuotas')
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
      console.warn('No se pueden calcular fechas: dueDay o cutOffDay no están configurados')
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
      console.error('Error al recargar los datos de cuotas')
      return
    }

    // Aplicar datos faltantes del backend (solución temporal)
    applyMissingDebtData(installmentsData.value.debt, originalDebt)
    
    // Recalcular fechas recomendadas
    await calculateInstallmentDatesForModal()
    
  } catch (error) {
    console.error('Error recargando cuotas:', error)
    console.error('Error al recargar el plan de cuotas')
  }
}

const createExpensesFromInstallments = async () => {
  if (!installmentsData.value?.schedule?.length || !installmentsData.value?.debt) {
    console.log('No hay datos de cuotas o deuda para procesar')
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
      console.warn(
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
    
    // Si existe un gasto fijo anterior, eliminar gastos relacionados
    if (existingFixedExpense) {
      const confirmReplace = await confirm.show({
        title: 'Reemplazar Plan de Cuotas',
        message: `Ya existe un plan de cuotas para "${debt.name}".\n\n¿Deseas reemplazarlo con el nuevo plan de ${installmentsData.value.schedule.length} cuotas?\n\nEsto eliminará los gastos anteriores y creará los nuevos.`,
        confirmText: 'Reemplazar',
        cancelText: 'Cancelar',
        variant: 'warning'
      })
      
      if (!confirmReplace) {
        return
      }
      
      // Eliminar gastos existentes relacionados con este crédito
      deletedExpensesCount = await removeExistingCreditExpenses(debt.name, creditCategory.id, existingFixedExpense.id)
      
      // Eliminar el gasto fijo anterior
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
    const expensesToCreate = installmentsData.value.schedule.map((installment, index) => {
      const calculatedDate = calculatedDates[index]
      
      if (!calculatedDate) {
        throw new Error(`No hay fecha calculada para cuota ${index + 1}`)
      }
      
      return {
        date: calculatedDate.date,
        description: `Cuota ${installment.period} - ${debt.name}`,
        amount: installment.payment,
        categoryId: creditCategory.id,
        isFixed: true,
        fixedExpenseId: createdFixedExpense.id
      }
    })
    
    // Crear todos los gastos de una vez usando el endpoint batch
    const expensesCreated = await expenseStore.addExpensesBatch(expensesToCreate)
    
    const action = existingFixedExpense ? 'actualizado' : 'creado'
    const replacementMessage = existingFixedExpense 
      ? `Se eliminaron ${deletedExpensesCount} gastos anteriores y se crearon ${expensesCreated.length} nuevos.`
      : 'Se creó un gasto fijo para futuros pagos automáticos.'
    
    const successMessage = `Plan de cuotas ${action} exitosamente para "${debt.name}".\n\n` +
      `• ${expensesCreated.length} cuotas programadas\n` +
      `• Fecha recomendada: ${recommendedDate.explanation}\n` +
      `• ${replacementMessage}`
    
    // Cerrar el modal y mostrar notificación de éxito
    installmentsData.value = null
    console.log(successMessage, `Plan de Cuotas ${action.charAt(0).toUpperCase() + action.slice(1)}`)
          
  } catch (error) {
    console.error('Error creando gastos desde cuotas:', error)
    installmentsData.value = null
    console.error(`Error al crear los gastos automáticos: ${error.message}`, 'Error en Plan de Cuotas')
  } finally {
    creatingExpenses.value = false
  }
}

/**
 * Elimina gastos existentes relacionados con un crédito
 * @param {string} debtName - Nombre de la deuda
 * @param {number} categoryId - ID de la categoría de crédito
 * @param {number} fixedExpenseId - ID del gasto fijo
 * @returns {number} - Número de gastos eliminados
 */
const removeExistingCreditExpenses = async (debtName, categoryId, fixedExpenseId) => {
  const existingExpenses = expenseStore.expenses.filter(expense => {
    const isCreditExpense = expense.description?.toLowerCase().includes('cuota') && 
                           expense.description?.toLowerCase().includes(debtName.toLowerCase())
    const hasMatchingFixedExpenseId = expense.fixedExpenseId === fixedExpenseId
    
    return (isCreditExpense || hasMatchingFixedExpenseId) && expense.categoryId === categoryId
  })
  
  // Eliminar gastos en paralelo para mejor rendimiento
  const deletePromises = existingExpenses.map(expense => 
    expenseStore.deleteExpense(expense.id).catch(error => {
      console.warn(`Error eliminando gasto ${expense.id}:`, error)
    })
  )
  
  await Promise.all(deletePromises)
  return existingExpenses.length
}

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


