<template>
  <div class="animate-pulse">
    <div v-if="type === 'card'" class="bg-white rounded-xl border border-gray-200 p-6">
      <div class="space-y-4">
        <div class="h-4 bg-gray-200 rounded w-3/4"></div>
        <div class="h-3 bg-gray-200 rounded w-1/2"></div>
        <div class="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
    
    <div v-else-if="type === 'table'" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="p-4 border-b border-gray-200">
        <div class="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
      <div class="divide-y divide-gray-200">
        <div v-for="i in rows" :key="i" class="p-4">
          <div class="flex items-center space-x-4">
            <div class="h-4 bg-gray-200 rounded w-1/4"></div>
            <div class="h-4 bg-gray-200 rounded w-1/6"></div>
            <div class="h-4 bg-gray-200 rounded w-1/6"></div>
            <div class="h-4 bg-gray-200 rounded w-1/8"></div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else-if="type === 'kpi'" class="bg-white rounded-xl border border-gray-200 p-4">
      <div class="space-y-3">
        <div class="h-3 bg-gray-200 rounded w-1/3"></div>
        <div class="h-8 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
    
    <div v-else-if="type === 'text'" class="space-y-2">
      <div class="h-4 bg-gray-200 rounded" :style="{ width: width }"></div>
    </div>
    
    <div v-else class="h-4 bg-gray-200 rounded" :style="{ width: width }"></div>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'text',
    validator: (value) => ['text', 'card', 'table', 'kpi'].includes(value)
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
