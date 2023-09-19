import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

console.log(import.meta.env.VITE_SOCKET_SERVER)

app.use(createPinia())
app.use(router)

app.mount('#app')
