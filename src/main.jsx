import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { migrateFromLocalStorage } from './migrate'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root'))

// Run the one-time localStorage → IndexedDB migration *before* rendering
// so components see the data on their very first read. For anything other
// than the first page load this resolves essentially instantly.
migrateFromLocalStorage()
  .catch(err => console.error('[achilles] migration failed:', err))
  .finally(() => {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  })
