import { mount } from 'svelte'
import App from './App.svelte'
import { initializeDatabase } from './services/database'
import './styles/global.css'

void initializeDatabase().catch((error: unknown) => {
  console.error("Impossible d'initialiser le stockage local IndexedDB.", error)
})

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
