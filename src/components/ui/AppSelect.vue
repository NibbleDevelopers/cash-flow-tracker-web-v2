<template>
  <div class="relative">
    <Listbox v-model="internalValue" :disabled="disabled" v-slot="{ open }">
      <div class="relative">
        <ListboxButton
          ref="buttonRef"
          @click="onOpenToggle"
          :class="buttonClass"
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
          <Teleport to="body">
            <ListboxOptions
              v-if="open"
              class="z-[60] overflow-auto rounded-lg bg-white py-0 text-sm shadow-xl ring-1 ring-black/10 focus:outline-none"
              :style="dropdownStyle"
            >
              <ListboxOption
                v-for="opt in normalizedOptions"
                :key="String(opt.value)"
                :value="opt.value"
                v-slot="{ active, selected }"
              >
                <li
                  :class="[
                    'relative cursor-pointer select-none h-10 pl-3 pr-9 flex items-center',
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
          </Teleport>
        </transition>
      </div>
    </Listbox>
  </div>
  
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
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
  },
  size: {
    type: String,
    default: 'md' // 'sm' | 'md' | 'lg'
  },
  maxItems: {
    type: Number,
    default: 5
  }
})

const emit = defineEmits(['update:modelValue'])

const internalValue = ref(props.modelValue)
const buttonRef = ref(null)
const dropdownStyle = ref({})
const itemHeightPx = 40 // altura aproximada por opción
const dropdownMaxHeightPx = computed(() => Math.max(40, Math.min(props.maxItems, normalizedOptions.value.length || 1) * itemHeightPx))

function updateDropdownPosition() {
  let btn = buttonRef.value
  if (!btn) return
  // HeadlessUI components pueden wrappear el elemento; tomar $el si existe
  const el = btn.$el ? btn.$el : btn
  if (!el || typeof el.getBoundingClientRect !== 'function') return
  const rect = el.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  const dropdownMaxHeight = dropdownMaxHeightPx.value
  const spaceBelow = viewportHeight - rect.bottom
  const openUpwards = spaceBelow < dropdownMaxHeight + 16 // margen de seguridad

  const top = openUpwards
    ? Math.max(16, rect.top - dropdownMaxHeight - 4)
    : Math.min(viewportHeight - 16, rect.bottom + 4)

  let left = rect.left
  const dropdownWidth = rect.width
  const rightOverflow = left + dropdownWidth - window.innerWidth
  if (rightOverflow > 0) {
    left = Math.max(16, left - rightOverflow)
  }

  dropdownStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    width: `${dropdownWidth}px`,
    maxHeight: `${dropdownMaxHeight}px`,
    overflow: 'auto'
  }
}

function onWindowChange() {
  updateDropdownPosition()
}

function onOpenToggle() {
  // Posicionar después de que Headless UI cambie el estado "open"
  nextTick(() => updateDropdownPosition())
}

onMounted(() => {
  window.addEventListener('resize', onWindowChange)
  window.addEventListener('scroll', onWindowChange, true)
  nextTick(updateDropdownPosition)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onWindowChange)
  window.removeEventListener('scroll', onWindowChange, true)
})

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

const sizeClass = computed(() => {
  // Mantener tipografía por tamaño, altura fija h-10 para consistencia
  if (props.size === 'sm') return 'text-sm'
  if (props.size === 'lg') return 'text-base'
  return 'text-sm'
})

const buttonClass = computed(() => [
  'w-full h-10 flex items-center cursor-default rounded-lg border border-gray-300 bg-white pl-3 pr-10 text-left text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
  sizeClass.value
])
</script>


