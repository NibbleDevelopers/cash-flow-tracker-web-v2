<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="state.isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/40" @click="onCancel"></div>
        <div class="relative z-10 w-full max-w-md mx-4 rounded-xl bg-white shadow-2xl border border-gray-200">
          <div :class="['px-5 py-4 rounded-t-xl text-white', headerClass]">
            <h3 class="text-base font-semibold">{{ state.title }}</h3>
          </div>
          <div class="px-5 py-4 text-sm text-gray-700">
            <p>{{ state.message }}</p>
          </div>
          <div class="px-5 py-4 bg-gray-50 flex justify-end gap-2 rounded-b-xl">
            <button @click="onCancel" class="px-3 py-1.5 text-sm rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-100">{{ state.cancelText }}</button>
            <button @click="onConfirm" :class="['px-3 py-1.5 text-sm rounded-md text-white', confirmClass]">{{ state.confirmText }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
  
</template>

<script setup>
import { computed } from 'vue'
import { confirmState as state, resolveConfirm } from '../../composables/useConfirm'

const headerClass = computed(() => state.variant === 'danger' ? 'bg-red-500' : 'bg-primary-600')
const confirmClass = computed(() => state.variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-primary-600 hover:bg-primary-700')

const onCancel = () => resolveConfirm(false)
const onConfirm = () => resolveConfirm(true)
</script>


