import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
import { PostedNotesProvider } from './context/PostedNotesContext'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <LanguageProvider>
        <PostedNotesProvider>
          <App />
        </PostedNotesProvider>
      </LanguageProvider>
    </HashRouter>
  </StrictMode>
)
