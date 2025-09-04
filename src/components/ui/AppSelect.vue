<template>
  <div class="relative">
    <Listbox v-model="internalValue" :disabled="disabled">
      <div class="relative">
        <ListboxButton
          class="w-full cursor-default rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-left text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <span class="block truncate" v-if="selectedLabel">{{ selectedLabel }}</span>
          <span class="block truncate text-gray-400" v-else>{{ placeholder }}</span>
          <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronUpDownIcon class="h-4 w-4 text-gray-400" />
          </span>
        </ListboxButton>

        <transition
          enter-active-class="transition ease-out duration-100"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition ease-in duration-75"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <ListboxOptions
            class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none"
          >
            <ListboxOption
              v-for="opt in normalizedOptions"
              :key="String(opt.value)"
              :value="opt.value"
              v-slot="{ active, selected }"
            >
              <li
                :class="[
                  'relative cursor-pointer select-none py-2 pl-3 pr-9',
                  active ? 'bg-primary-50 text-primary-900' : 'text-gray-700'
                ]"
              >
                <span :class="['block truncate', selected ? 'font-medium' : 'font-normal']">{{ opt.label }}</span>
                <span
                  v-if="selected"
                  class="absolute inset-y-0 right-0 flex items-center pr-3 text-primary-600"
                >
                  <CheckIcon class="h-4 w-4" />
                </span>
              </li>
            </ListboxOption>
          </ListboxOptions>
        </transition>
      </div>
    </Listbox>
  </div>
  
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'

const props = defineProps({
  modelValue: {
    type: [String, Number, null],
    default: null
  },
  options: {
    type: Array,
    default: () => [] // [{ label, value }]
  },
  placeholder: {
    type: String,
    default: 'Selecciona una opción'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const internalValue = ref(props.modelValue)

watch(
  () => props.modelValue,
  (val) => {
    internalValue.value = val
  }
)

watch(internalValue, (val) => emit('update:modelValue', val))

const normalizedOptions = computed(() =>
  props.options.map((o) => ({ label: o.label ?? String(o.value ?? ''), value: o.value }))
)

const selectedLabel = computed(() => {
  const found = normalizedOptions.value.find((o) => String(o.value) === String(internalValue.value))
  return found ? found.label : ''
})
</script>


