import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// Tailwind CSS 4
import '@/assets/styles/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount(document.body)
