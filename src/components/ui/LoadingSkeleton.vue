<template>
  <div class="animate-pulse">
    <div v-if="type === 'card'" class="bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-4">
      <div class="space-y-3 sm:space-y-4">
        <div class="h-3 sm:h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
        <div class="h-2 sm:h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
        <div class="h-2 sm:h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-2/3"></div>
      </div>
    </div>
    
    <div v-else-if="type === 'metrics'" class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      <div v-for="i in 4" :key="i" class="bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-4">
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <div class="h-2 sm:h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4 mb-2"></div>
            <div class="h-4 sm:h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2 mb-1"></div>
            <div class="h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/3"></div>
          </div>
          <div class="p-2 sm:p-3 bg-gray-200 rounded-full flex-shrink-0">
            <div class="w-4 h-4 sm:w-6 sm:h-6 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else-if="type === 'chart'" class="bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-4">
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <div class="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/3"></div>
          <div class="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/4"></div>
        </div>
        <div class="h-48 sm:h-64 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
      </div>
    </div>
    
    <div v-else-if="type === 'calendar'" class="bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-4">
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <div class="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/4"></div>
          <div class="flex space-x-2">
            <div class="h-6 w-6 bg-gray-200 rounded"></div>
            <div class="h-6 w-6 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div class="grid grid-cols-7 gap-1">
          <div v-for="i in 35" :key="i" class="h-8 sm:h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
        </div>
      </div>
    </div>
    
    <div v-else-if="type === 'table'" class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="space-y-0">
        <div class="bg-gray-50 p-3 sm:p-4 border-b border-gray-200">
          <div class="grid grid-cols-3 gap-4">
            <div class="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
            <div class="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
            <div class="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
          </div>
        </div>
        <div v-for="i in rows" :key="i" class="p-3 sm:p-4 border-b border-gray-100">
          <div class="grid grid-cols-3 gap-4">
            <div class="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full"></div>
            <div class="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full"></div>
            <div class="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full"></div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else-if="type === 'text'" class="space-y-2">
      <div class="h-3 sm:h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded" :style="{ width: width }"></div>
    </div>
    
    <div v-else class="h-3 sm:h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded" :style="{ width: width }"></div>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'text',
    validator: (value) => ['text', 'card', 'metrics', 'chart', 'calendar', 'table'].includes(value)
  },
  width: {
    type: String,
    default: '100%'
  },
  rows: {
    type: Number,
    default: 3
  }
})
</script>

