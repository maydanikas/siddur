import ReactDOM from 'react-dom/client'
import './index.css'
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

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<App />)

requestAnimationFrame(() => {
  document.getElementById('static-splash')?.remove()
})