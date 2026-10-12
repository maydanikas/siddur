import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { readJewishDay } from './jewishCalendar.ts'
import { registerSW } from 'virtual:pwa-register'

try {
  readJewishDay()
} catch {
  /* the date stays unread until the next opening */
}

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New version available. Update now?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('Siddur is ready for offline mode.')
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)