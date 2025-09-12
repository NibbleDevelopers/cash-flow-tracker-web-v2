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
      <div v-if="state.isOpen" class="fixed inset-0 z-[60] flex items-center justify-center">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px]" @click="!state.persistent && onCancel()"></div>
        <div class="relative z-10 w-full max-w-md mx-4 rounded-xl bg-white shadow-2xl ring-1 ring-black/10">
          <div class="px-5 py-4 rounded-t-xl flex items-center gap-3" :class="headerBg">
            <span :class="iconBg" class="inline-flex items-center justify-center w-9 h-9 rounded-lg">
              <svg v-if="state.variant === 'danger' || state.variant === 'warning'" class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M5.07 19h13.86A2 2 0 0021 17.93L13.41 4.59a2 2 0 00-3.42 0L3 17.93A2 2 0 005.07 19z"/></svg>
              <svg v-else class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </span>
            <h3 class="text-base font-semibold text-white">{{ state.title }}</h3>
          </div>
          <div class="px-5 py-4 text-sm text-gray-700">
            <p class="leading-relaxed">{{ state.message }}</p>
          </div>
          <div class="px-5 py-4 bg-gray-50 flex justify-end gap-2 rounded-b-xl">
            <button @click="onCancel" class="px-3 py-1.5 text-sm rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300">{{ state.cancelText }}</button>
            <button @click="onConfirm" :class="['px-3 py-1.5 text-sm rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2', confirmClass]">{{ state.confirmText }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
  
</template>

<script setup>
import { computed } from 'vue'
import { confirmState as state, resolveConfirm } from '../../composables/useConfirm'

const headerBg = computed(() => {
  if (state.variant === 'danger') return 'bg-red-600'
  if (state.variant === 'warning') return 'bg-yellow-500'
  return 'bg-primary-600'
})
const iconBg = computed(() => {
  if (state.variant === 'danger') return 'bg-red-700/40'
  if (state.variant === 'warning') return 'bg-yellow-600/25'
  return 'bg-white/15'
})
const confirmClass = computed(() => {
  if (state.variant === 'danger') return 'bg-red-600 hover:bg-red-700 focus:ring-red-200'
  if (state.variant === 'warning') return 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-200'
  return 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-200'
})

const onCancel = () => resolveConfirm(false)
const onConfirm = () => resolveConfirm(true)
</script>


