import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'

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