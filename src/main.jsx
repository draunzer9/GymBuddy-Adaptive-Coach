import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as amplitude from '@amplitude/unified'
import './index.css'
import App from './App.jsx'

amplitude.initAll('3784cb32506172a7a7ab45a1a2fa041a', {"analytics":{"autocapture":true},"sessionReplay":{"sampleRate":1}});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
