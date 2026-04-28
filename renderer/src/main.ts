import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './styles/global.css'
import { useAppStore } from '@/stores/app'

async function bootstrap(): Promise<void> {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)

  const store = useAppStore(pinia)
  await store.initialize()

  app.mount('#app')
}

void bootstrap()
