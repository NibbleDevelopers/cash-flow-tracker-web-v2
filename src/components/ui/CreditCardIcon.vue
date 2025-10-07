<template>
  <div class="credit-card-icon" :class="sizeClass">
    <!-- Visa -->
    <svg v-if="type === 'visa'" viewBox="0 0 40 24" fill="none">
      <rect width="40" height="24" rx="4" fill="white" stroke="#E5E7EB" stroke-width="1"/>
      <!-- Visa Logo -->
      <g transform="translate(6, 8)">
        <!-- V de Visa -->
        <path d="M2 2h2l-1 4 1-4h2L4 10H2L1 6L2 2z" fill="#1A1F71"/>
        <!-- I de Visa -->
        <rect x="7" y="2" width="2" height="8" fill="#1A1F71"/>
        <!-- S de Visa -->
        <path d="M11 2h3c1.1 0 2 .9 2 2v1c0 .6-.4 1-1 1h-2v1h2c.6 0 1 .4 1 1v1c0 1.1-.9 2-2 2h-3V2zm2 2v1h1c.6 0 1-.4 1-1s-.4-1-1-1h-1zm0 3h1c.6 0 1 .4 1 1s-.4 1-1 1h-1V7z" fill="#1A1F71"/>
        <!-- A de Visa -->
        <path d="M18 10L16 2h2l1 4 1-4h2l-2 8h-2zm1-3l-1-3-1 3h2z" fill="#1A1F71"/>
      </g>
    </svg>

    <!-- Mastercard -->
    <svg v-else-if="type === 'mastercard'" viewBox="0 0 40 24" fill="none">
      <rect width="40" height="24" rx="4" fill="white" stroke="#E5E7EB" stroke-width="1"/>
      <!-- Mastercard Logo -->
      <g transform="translate(10, 8)">
        <!-- Círculos superpuestos -->
        <circle cx="4" cy="4" r="4" fill="#EB001B"/>
        <circle cx="8" cy="4" r="4" fill="#F79E1B"/>
        <!-- Intersección -->
        <path d="M6 4c0-1.1.9-2 2-2s2 .9 2 2c0 1.1-.9 2-2 2s-2-.9-2-2z" fill="#FF5F00"/>
        <!-- Texto -->
        <text x="6" y="12" text-anchor="middle" font-family="Arial, sans-serif" font-size="2" font-weight="bold" fill="#1A1F71">mastercard</text>
      </g>
    </svg>

    <!-- American Express -->
    <svg v-else-if="type === 'amex'" viewBox="0 0 40 24" fill="none">
      <rect width="40" height="24" rx="4" fill="#006FCF"/>
      <!-- Amex Logo -->
      <g transform="translate(8, 8)" fill="white">
        <!-- AMEX Text -->
        <text x="2" y="5" font-family="Arial, sans-serif" font-size="3.5" font-weight="bold">AMEX</text>
        <!-- Centurion -->
        <circle cx="26" cy="3" r="2" fill="white"/>
        <path d="M26 1.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5S28.3 3 27.5 3 26 2.3 26 1.5z" fill="#006FCF"/>
        <text x="26" y="5.5" text-anchor="middle" font-family="Arial, sans-serif" font-size="1.5" font-weight="bold">CENTURION</text>
      </g>
    </svg>

    <!-- Discover -->
    <svg v-else-if="type === 'discover'" viewBox="0 0 40 24" fill="none">
      <rect width="40" height="24" rx="4" fill="#FF6000"/>
      <!-- Discover Logo -->
      <g transform="translate(8, 8)">
        <rect x="0" y="0" width="24" height="8" rx="1" fill="white"/>
        <!-- D de Discover -->
        <path d="M2 1h2c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2H2V1z" fill="#FF6000"/>
        <!-- Círculo central -->
        <circle cx="12" cy="4" r="2" fill="#FF6000"/>
        <path d="M12 2v4M10 4h4" stroke="#FF6000" stroke-width="0.5" fill="none"/>
        <!-- Texto -->
        <text x="18" y="5" font-family="Arial, sans-serif" font-size="2" font-weight="bold" fill="#FF6000">discover</text>
      </g>
    </svg>

    <!-- Generic Credit Card -->
    <svg v-else viewBox="0 0 40 24" fill="none">
      <rect width="40" height="24" rx="4" fill="white" stroke="#E5E7EB" stroke-width="1"/>
      <rect x="4" y="10" width="32" height="6" rx="1" fill="#F3F4F6"/>
      <rect x="4" y="18" width="12" height="2" rx="1" fill="#D1D5DB"/>
      <rect x="4" y="20" width="8" height="1" rx="0.5" fill="#D1D5DB"/>
      <rect x="28" y="18" width="8" height="2" rx="1" fill="#D1D5DB"/>
      <text x="20" y="7" text-anchor="middle" font-family="Arial, sans-serif" font-size="3" font-weight="bold" fill="#6B7280">CREDIT CARD</text>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['visa', 'mastercard', 'amex', 'discover', 'generic'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large', 'xlarge'].includes(value)
  }
})

const sizeClass = computed(() => {
  const sizes = {
    small: 'w-8 h-5',
    medium: 'w-12 h-7',
    large: 'w-20 h-12',
    xlarge: 'w-24 h-14'
  }
  return sizes[props.size]
})
</script>

<style scoped>
.credit-card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.credit-card-icon svg {
  width: 100%;
  height: 100%;
}
</style>
