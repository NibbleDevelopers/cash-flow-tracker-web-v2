<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">Deudas</h2>
      <button class="btn-primary" @click="openCreate">Nueva deuda</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="card">
        <div class="text-xs text-gray-500">Total deudas</div>
        <div class="text-2xl font-semibold">
          <span v-if="!loading">{{ formatCurrency(totalBalance) }}</span>
          <LoadingSkeleton v-else type="text" width="6rem" />
        </div>
      </div>
      <div class="card">
        <div class="text-xs text-gray-500">Límite total</div>
        <div class="text-2xl font-semibold">
          <span v-if="!loading">{{ formatCurrency(totalLimit) }}</span>
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
          <h3 class="text-lg font-medium text-gray-900 mb-2">Sin deudas registradas</h3>
          <p class="text-gray-500 mb-4">Comienza agregando tu primera tarjeta de crédito o préstamo</p>
          <button class="btn-primary" @click="openCreate">Agregar primera deuda</button>
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
                    <CalendarDaysIcon class="h-5 w-5" />
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

    <div v-if="installmentsData" class="card">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-lg font-medium">Plan de cuotas: {{ installmentsData?.debt?.name }}</h3>
        <button class="btn-secondary" @click="installmentsData = null">Cerrar</button>
      </div>
      <div class="flex items-center space-x-2 mb-3">
        <label class="text-sm">Meses</label>
        <input v-model.number="installmentMonths" type="number" min="1" max="120" class="input-field w-32" />
        <button class="btn-primary" @click="reloadInstallments">Recalcular</button>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Periodo</th>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Pago</th>
              <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Interés</th>
              <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Capital</th>
              <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Saldo</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="row in installmentsData.schedule" :key="row.period">
              <td class="px-3 py-2">{{ row.period }}</td>
              <td class="px-3 py-2">{{ row.date }}</td>
              <td class="px-3 py-2 text-right">{{ formatCurrency(row.payment) }}</td>
              <td class="px-3 py-2 text-right">{{ formatCurrency(row.interest) }}</td>
              <td class="px-3 py-2 text-right">{{ formatCurrency(row.principal) }}</td>
              <td class="px-3 py-2 text-right">{{ formatCurrency(row.remainingBalance) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useDebtStore } from '../stores/debtStore'
import { storeToRefs } from 'pinia'
import DebtForm from '../components/DebtForm.vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { PencilSquareIcon, ChartBarIcon, CalendarDaysIcon, TrashIcon } from '@heroicons/vue/24/outline'
import LoadingSkeleton from '../components/ui/LoadingSkeleton.vue'

const debtStore = useDebtStore()
const { debts, loading, totalBalance, totalCreditLimit, utilizationRate, activeDebts } = storeToRefs(debtStore)

// Estado local del componente
const showForm = ref(false)
const editing = ref(false)
const formModel = ref({})
const summaryData = ref(null)
const installmentsData = ref(null)
const installmentMonths = ref(12)

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

onMounted(() => {
  if (!debts.value?.length) debtStore.loadDebts()
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
  installmentsData.value = await debtStore.fetchDebtInstallments(debt.id, { months: installmentMonths.value })
}

const reloadInstallments = async () => {
  if (installmentsData.value?.debt?.id) {
    installmentsData.value = await debtStore.fetchDebtInstallments(installmentsData.value.debt.id, { months: installmentMonths.value })
  }
}
</script>


