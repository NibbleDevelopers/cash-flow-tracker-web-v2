<template>
  <Teleport to="body">
    <Transition enter-active-class="ease-out duration-300" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="ease-in duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="isOpen" class="fixed inset-0 bg-black/50 z-40" @click="onClose"></div>
    </Transition>

    <Transition enter-active-class="ease-out duration-300" enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to-class="opacity-100 translate-y-0 sm:scale-100" leave-active-class="ease-in duration-200" leave-from-class="opacity-100 translate-y-0 sm:scale-100" leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
      <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto" @click.self="onClose">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
            <div class="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-white">Editar Gasto Fijo</h3>
                <button @click="onClose" class="rounded-md text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600">
                  <span class="sr-only">Cerrar</span>
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <div class="px-6 py-6">
              <form @submit.prevent="onSubmit" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input v-model="localForm.name" required type="text" class="input-field" placeholder="Ej: Netflix" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                  <input v-model="localForm.amount" required type="number" step="0.01" min="0" class="input-field" placeholder="0.00" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <AppSelect v-model="localForm.categoryId" :options="categoryOptions" placeholder="Selecciona una categoría" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Día del mes</label>
                  <input v-model="localForm.dayOfMonth" required type="number" min="1" max="31" class="input-field" placeholder="15" />
                </div>
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p class="text-sm font-medium text-gray-700">Activo</p>
                    <p class="text-xs text-gray-500">Usar en generación mensual</p>
                  </div>
                  <Switch
                    v-model="localForm.active"
                    :class="localForm.active ? 'bg-primary-600' : 'bg-gray-200'"
                    class="relative inline-flex h-6 w-11 items-center rounded-full transition"
                  >
                    <span class="sr-only">Activo</span>
                    <span
                      :class="localForm.active ? 'translate-x-6' : 'translate-x-1'"
                      class="inline-block h-4 w-4 transform rounded-full bg-white transition"
                    />
                  </Switch>
                </div>

                <div class="flex space-x-3 pt-2">
                  <button type="button" @click="onClose" class="btn-secondary flex-1">Cancelar</button>
                  <button type="submit" :disabled="loading" class="btn-primary flex-1" :class="{ 'opacity-50 cursor-not-allowed': loading }">
                    <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardar cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import { useExpenseStore } from '../stores/expenseStore'
import AppSelect from './ui/AppSelect.vue'
import { Switch } from '@headlessui/vue'

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  fixedExpense: { type: Object, default: null },
  mode: { type: String, default: 'edit' } // 'edit' | 'create'
})

const emit = defineEmits(['close', 'updated', 'created'])
const expenseStore = useExpenseStore()
const loading = computed(() => expenseStore.loading)

const localForm = reactive({
  id: '',
  name: '',
  amount: '',
  categoryId: '',
  dayOfMonth: '',
  active: true
})

watch(() => props.isOpen, (open) => {
  if (!open) return
  if (props.mode === 'edit' && props.fixedExpense) {
    localForm.id = props.fixedExpense.id
    localForm.name = props.fixedExpense.name || ''
    localForm.amount = String(props.fixedExpense.amount ?? '')
    localForm.categoryId = String(props.fixedExpense.categoryId ?? '')
    localForm.dayOfMonth = String(props.fixedExpense.dayOfMonth ?? '')
    localForm.active = props.fixedExpense.active !== false
  } else {
    localForm.id = ''
    localForm.name = ''
    localForm.amount = ''
    localForm.categoryId = ''
    localForm.dayOfMonth = ''
    localForm.active = true
  }
})

const categoryOptions = computed(() => (expenseStore.activeCategories || []).map(c => ({ label: c.name, value: String(c.id) })))

const onClose = () => emit('close')

const onSubmit = async () => {
  if (props.mode === 'edit') {
    await expenseStore.updateFixedExpense({
      id: localForm.id,
      name: localForm.name,
      amount: localForm.amount,
      categoryId: localForm.categoryId,
      dayOfMonth: localForm.dayOfMonth,
      active: localForm.active
    })
    emit('updated')
  } else {
    await expenseStore.addFixedExpense({
      name: localForm.name,
      amount: localForm.amount,
      categoryId: localForm.categoryId,
      dayOfMonth: localForm.dayOfMonth,
      active: localForm.active
    })
    emit('created')
  }
}
</script>

<style scoped>
.input-field { @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500; }
.btn-primary { @apply inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed; }
.btn-secondary { @apply inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500; }
</style>


