import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { createNotivue } from 'notivue'
import 'notivue/notification.css'
import 'notivue/animations.css'
import VueConfirmPlugin from 'v3confirm'
import VueApexCharts from 'vue3-apexcharts'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(createNotivue({ position: 'top-right', avoidDuplicates: true }))
app.use(VueApexCharts)
app.use(VueConfirmPlugin, {
  root: '#confirm',
  yesText: 'Aceptar',
  noText: 'Cancelar'
})

app.mount('#app')
