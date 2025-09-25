<template>
  <div class="flex items-center justify-between w-full">
    <div class="min-w-0">
      <p v-if="label" class="text-sm font-medium text-gray-700">{{ label }}</p>
      <p v-if="description" class="text-xs text-gray-500">{{ description }}</p>
    </div>
    <Switch
      v-model="internalValue"
      :class="internalValue ? 'bg-primary-600' : 'bg-gray-200'"
      class="relative inline-flex h-6 w-11 items-center rounded-full transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
    >
      <span class="sr-only">{{ aria }}</span>
      <span
        :class="internalValue ? 'translate-x-6' : 'translate-x-1'"
        class="inline-block h-4 w-4 transform rounded-full bg-white transition"
      />
    </Switch>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Switch } from '@headlessui/vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: '' },
  description: { type: String, default: '' },
  aria: { type: String, default: 'Alternar' }
})

const emit = defineEmits(['update:modelValue'])
const internalValue = ref(!!props.modelValue)

watch(() => props.modelValue, (v) => { internalValue.value = !!v })
watch(internalValue, (v) => emit('update:modelValue', v))
</script>


