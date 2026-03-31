import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { DesktopProvider } from './contexts/DesktopContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DesktopProvider>
      <App />
    </DesktopProvider>
  </StrictMode>,
)

// takes our app and puts in <div id="root"></div> in index.html