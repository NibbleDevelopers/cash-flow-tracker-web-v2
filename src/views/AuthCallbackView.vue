<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-blue-50">
    <div class="text-center">
      <!-- Loading spinner -->
      <div class="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-6">
        <svg class="w-12 h-12 animate-spin text-primary-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 mb-2">
        {{ status === 'error' ? 'Error de autenticación' : 'Autenticando...' }}
      </h2>
      <p class="text-gray-600 mb-6">
        {{ message }}
      </p>

      <!-- Botón de error -->
      <button
        v-if="status === 'error'"
        @click="goToLogin"
        class="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 shadow-md hover:shadow-lg"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver al Login
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { setToken, isAuthenticated } from '../services/auth.js'

const router = useRouter()
const route = useRoute()
const status = ref('loading') // 'loading' | 'success' | 'error'
const message = ref('Verificando credenciales...')

onMounted(() => {
  handleCallback()
})

const handleCallback = () => {
  try {
    // Obtener token de la URL
    const token = route.query.token

    if (!token) {
      status.value = 'error'
      message.value = 'No se recibió el token de autenticación. Por favor intenta nuevamente.'
      return
    }

    // Guardar token
    setToken(token)

    // Verificar que el token sea válido
    if (!isAuthenticated()) {
      status.value = 'error'
      message.value = 'El token recibido no es válido. Por favor intenta nuevamente.'
      return
    }

    // Éxito - redirigir al dashboard
    status.value = 'success'
    message.value = '¡Autenticación exitosa! Redirigiendo...'

    // Pequeño delay para mostrar el mensaje de éxito
    setTimeout(() => {
      router.push('/')
    }, 800)

  } catch (error) {
    console.error('Error en callback:', error)
    status.value = 'error'
    message.value = 'Ocurrió un error al procesar la autenticación. Por favor intenta nuevamente.'
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

