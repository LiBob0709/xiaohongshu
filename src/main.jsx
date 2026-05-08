import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
import { PostedNotesProvider } from './context/PostedNotesContext'
import { ChatHistoryProvider } from './context/ChatHistoryContext'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <LanguageProvider>
        <PostedNotesProvider>
          <ChatHistoryProvider>
            <App />
          </ChatHistoryProvider>
        </PostedNotesProvider>
      </LanguageProvider>
    </HashRouter>
  </StrictMode>
)
